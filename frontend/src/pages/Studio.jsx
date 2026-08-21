import { useState, useRef, useEffect } from 'react';
import { Play, Save, Settings, Layers, Box, Type, Image as ImageIcon, MousePointer2, Settings2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';

const Studio = () => {
    const { gameId } = useParams();
    const [selectedTool, setSelectedTool] = useState('select');
    const [canvasObjects, setCanvasObjects] = useState([
        { id: 1, type: 'player', x: 400, y: 300, color: 'bg-red-500' },
        { id: 2, type: 'ground', x: 400, y: 500, w: 800, h: 40, color: 'bg-brown-800' }
    ]);
    const [selectedObjectId, setSelectedObjectId] = useState(null);
    const ws = useRef(null);

    useEffect(() => {
        // Load initial state
        const loadGame = async () => {
            try {
                const response = await apiClient.get(`games/${gameId}/studio/`);
                if (response.data.game_data && response.data.game_data.length > 0) {
                    setCanvasObjects(response.data.game_data);
                }
            } catch (err) {
                console.error("Failed to load game data", err);
            }
        };
        loadGame();

        // Setup WebSocket for real-time collaboration
        ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/studio/${gameId}/`);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.action === 'object_moved') {
                const payload = data.payload;
                setCanvasObjects(prev => prev.map(obj => 
                    obj.id === payload.id ? { ...obj, x: payload.x, y: payload.y } : obj
                ));
            } else if (data.action === 'object_created') {
                setCanvasObjects(prev => [...prev, data.payload]);
            } else if (data.action === 'object_deleted') {
                setCanvasObjects(prev => prev.filter(obj => obj.id !== data.payload.id));
                if (selectedObjectId === data.payload.id) {
                    setSelectedObjectId(null);
                }
            }
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [gameId]);

    const tools = [
        { id: 'select', icon: MousePointer2, label: 'Select' },
        { id: 'block', icon: Box, label: 'Block' },
        { id: 'text', icon: Type, label: 'Text' },
        { id: 'image', icon: ImageIcon, label: 'Image' },
    ];

    const handleCanvasClick = (e) => {
        if (selectedTool === 'block') {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const newObj = {
                id: Date.now(),
                type: 'block',
                x,
                y,
                w: 100,
                h: 20,
                color: 'bg-brown-600'
            };
            
            setCanvasObjects([...canvasObjects, newObj]);
            
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({
                    action: 'object_created',
                    payload: newObj
                }));
            }
            
            setSelectedTool('select');
        } else {
            // Deselect if clicking on empty canvas
            if (e.target === e.currentTarget) {
                setSelectedObjectId(null);
            }
        }
    };

    const selectedObject = canvasObjects.find(obj => obj.id === selectedObjectId);

    const [isSaving, setIsSaving] = useState(false);
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await apiClient.post(`games/${gameId}/save_version/`, { game_data: canvasObjects });
            alert("Game saved successfully!");
        } catch (err) {
            console.error("Failed to save game", err);
            alert("Failed to save game. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAIGenerate = async (e) => {
        e.preventDefault();
        if (!aiPrompt.trim()) return;
        
        setIsGenerating(true);
        try {
            // Import axios client or use fetch. Let's use standard fetch for simplicity in this component or window.fetch
            const token = localStorage.getItem('access_token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token && token !== 'null' && token !== 'undefined') {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://127.0.0.1:8000/api/ai/generate/', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ prompt: aiPrompt })
            });
            const data = await response.json();
            
            if (data.status === 'success') {
                setCanvasObjects(data.objects);
                setAiPrompt('');
                alert(data.message);
            } else {
                alert("AI Generation failed.");
            }
        } catch (err) {
            console.error(err);
            alert("Error communicating with AI Assistant.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col bg-cream rounded-2xl overflow-hidden border border-beige-sand shadow-sm">
            {/* Top Toolbar */}
            <header className="h-14 bg-brown-900 border-b border-brown-800 flex items-center justify-between px-4 text-cream shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold hidden sm:block">My Awesome Game</h2>
                    <div className="h-4 w-px bg-brown-600 hidden sm:block"></div>
                    
                    <form onSubmit={handleAIGenerate} className="flex items-center gap-2">
                        <input 
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Ask AI to generate a level (e.g. 'platformer')..."
                            className="bg-brown-800 border border-brown-600 text-sm text-cream px-3 py-1.5 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-terracotta"
                        />
                        <button 
                            type="submit"
                            disabled={isGenerating}
                            className="text-xs bg-terracotta hover:bg-terracotta-accent px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {isGenerating ? 'Generating...' : 'Magic Generate'}
                        </button>
                    </form>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-brown-800 transition-colors text-beige">
                        <Play size={16} />
                        Test
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-terracotta hover:bg-terracotta-accent transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-brown-800 transition-colors text-beige ml-2">
                        <Settings size={18} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Tools */}
                <aside className="w-16 bg-cream-warm border-r border-beige-sand flex flex-col items-center py-4 gap-4 shrink-0">
                    {tools.map(tool => (
                        <button 
                            key={tool.id}
                            onClick={() => setSelectedTool(tool.id)}
                            title={tool.label}
                            className={`p-3 rounded-xl transition-all ${
                                selectedTool === tool.id 
                                    ? 'bg-brown-900 text-cream shadow-md' 
                                    : 'text-brown-600 hover:bg-beige hover:text-brown-900'
                            }`}
                        >
                            <tool.icon size={20} />
                        </button>
                    ))}
                    <div className="w-8 h-px bg-beige-sand my-2"></div>
                    <button className="p-3 rounded-xl text-brown-600 hover:bg-beige hover:text-brown-900 transition-all">
                        <Layers size={20} />
                    </button>
                </aside>

                {/* Center - Canvas Area */}
                <main className="flex-1 bg-brown-800 relative overflow-hidden flex items-center justify-center p-8">
                    {/* Grid Pattern Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #FFF8F0 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    
                    {/* The Canvas */}
                    <div 
                        className="w-[800px] h-[600px] bg-white relative shadow-2xl rounded overflow-hidden"
                        onClick={handleCanvasClick}
                    >
                        {canvasObjects.map(obj => (
                            <motion.div
                                key={obj.id}
                                drag={selectedTool === 'select'}
                                dragMomentum={false}
                                onDragEnd={(e, info) => {
                                    const newObjs = canvasObjects.map(o => {
                                        if (o.id === obj.id) {
                                            const newObj = { ...o, x: o.x + info.offset.x, y: o.y + info.offset.y };
                                            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                                                ws.current.send(JSON.stringify({
                                                    action: 'object_moved',
                                                    payload: { id: newObj.id, x: newObj.x, y: newObj.y }
                                                }));
                                            }
                                            return newObj;
                                        }
                                        return o;
                                    });
                                    setCanvasObjects(newObjs);
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(selectedTool === 'select') setSelectedObjectId(obj.id);
                                }}
                                className={`absolute rounded-sm ${obj.color} ${selectedObjectId === obj.id ? 'ring-4 ring-terracotta ring-opacity-70' : ''}`}
                                style={{
                                    left: obj.type === 'ground' ? 0 : obj.x - (obj.w || 32)/2,
                                    top: obj.type === 'ground' ? obj.y : obj.y - (obj.h || 32)/2,
                                    width: obj.w || 32,
                                    height: obj.h || 32,
                                    cursor: selectedTool === 'select' ? 'grab' : 'default'
                                }}
                                whileDrag={{ cursor: 'grabbing', scale: 1.05 }}
                            />
                        ))}
                    </div>
                </main>

                {/* Right Sidebar - Properties */}
                <aside className="w-64 bg-cream-warm border-l border-beige-sand p-4 overflow-y-auto shrink-0 hidden md:block">
                    <div className="flex items-center gap-2 mb-6 text-brown-900">
                        <Settings2 size={18} />
                        <h3 className="font-bold">Properties</h3>
                    </div>

                    {selectedObject ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-brown-500 mb-1 uppercase tracking-wider">Type</label>
                                <div className="bg-white border border-beige-sand rounded-lg px-3 py-2 text-sm text-brown-900 capitalize">
                                    {selectedObject.type}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-brown-500 mb-1">X Pos</label>
                                    <input 
                                        type="number" 
                                        value={Math.round(selectedObject.x)} 
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setCanvasObjects(canvasObjects.map(o => {
                                                if (o.id === selectedObject.id) {
                                                    const newObj = {...o, x: val};
                                                    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                                                        ws.current.send(JSON.stringify({
                                                            action: 'object_moved',
                                                            payload: { id: newObj.id, x: newObj.x, y: newObj.y }
                                                        }));
                                                    }
                                                    return newObj;
                                                }
                                                return o;
                                            }));
                                        }}
                                        className="w-full bg-white border border-beige-sand rounded-lg px-3 py-2 text-sm text-brown-900 focus:outline-none focus:ring-1 focus:ring-terracotta"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brown-500 mb-1">Y Pos</label>
                                    <input 
                                        type="number" 
                                        value={Math.round(selectedObject.y)} 
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setCanvasObjects(canvasObjects.map(o => {
                                                if (o.id === selectedObject.id) {
                                                    const newObj = {...o, y: val};
                                                    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                                                        ws.current.send(JSON.stringify({
                                                            action: 'object_moved',
                                                            payload: { id: newObj.id, x: newObj.x, y: newObj.y }
                                                        }));
                                                    }
                                                    return newObj;
                                                }
                                                return o;
                                            }));
                                        }}
                                        className="w-full bg-white border border-beige-sand rounded-lg px-3 py-2 text-sm text-brown-900 focus:outline-none focus:ring-1 focus:ring-terracotta"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-beige">
                                <button 
                                    onClick={() => {
                                        setCanvasObjects(canvasObjects.filter(o => o.id !== selectedObject.id));
                                        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                                            ws.current.send(JSON.stringify({
                                                action: 'object_deleted',
                                                payload: { id: selectedObject.id }
                                            }));
                                        }
                                        setSelectedObjectId(null);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Delete Object
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-brown-400 text-sm">
                            Select an object on the canvas to view its properties.
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default Studio;
