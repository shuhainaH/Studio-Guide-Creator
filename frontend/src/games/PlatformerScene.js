import Phaser from 'phaser';

export default class PlatformerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlatformerScene' });
    }

    preload() {}

    create() {
        this.score = 0;
        this.otherPlayers = {}; // Track other connected players

        // Background
        this.cameras.main.setBackgroundColor('#8B5E3C');

        const colorMap = {
            'bg-red-500': 0xff0000,
            'bg-brown-800': 0x3A261C,
            'bg-brown-600': 0x6F4E37,
            'bg-terracotta-accent': 0xE25E3E,
        };

        const gameData = this.registry.get('gameData');
        this.platforms = this.physics.add.staticGroup();
        
        let playerObj = { x: 100, y: 300, w: 32, h: 32, color: 'bg-red-500' };

        if (gameData && gameData.length > 0) {
            gameData.forEach(obj => {
                const hexColor = colorMap[obj.color] || 0x6F4E37;
                if (obj.type === 'player') {
                    playerObj = obj;
                } else if (obj.type === 'block' || obj.type === 'ground') {
                    this.platforms.add(this.add.rectangle(obj.x, obj.y, obj.w || 100, obj.h || 20, hexColor));
                }
            });
        } else {
            // Fallback
            this.platforms.add(this.add.rectangle(400, 580, 800, 40, 0x3A261C));
            this.platforms.add(this.add.rectangle(600, 400, 200, 20, 0x6F4E37));
            this.platforms.add(this.add.rectangle(150, 250, 200, 20, 0x6F4E37));
            this.platforms.add(this.add.rectangle(750, 220, 200, 20, 0x6F4E37));
        }

        // Player
        const pColor = colorMap[playerObj.color] || 0xff0000;
        this.player = this.add.rectangle(playerObj.x, playerObj.y, playerObj.w || 32, playerObj.h || 32, pColor);
        this.physics.add.existing(this.player);
        this.player.body.setBounce(0.2);
        this.player.body.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.platforms);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // UI
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#FFF8F0', fontFamily: 'Inter' });

        // Multiplayer WebSocket Setup
        this.setupMultiplayer();
        
        // Throttling for sending updates
        this.lastEmitTime = 0;
    }

    setupMultiplayer() {
        const slug = window.location.pathname.split('/').pop() || 'demo';
        this.ws = new WebSocket(`ws://127.0.0.1:8000/ws/game/${slug}/`);

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.action === 'player_joined') {
                console.log("A player joined:", data.player_id);
            } 
            else if (data.action === 'player_left') {
                if (this.otherPlayers[data.player_id]) {
                    this.otherPlayers[data.player_id].destroy();
                    delete this.otherPlayers[data.player_id];
                }
            } 
            else if (data.action === 'player_moved') {
                // If it's not us (server broadcasts to all, but we handle the filtering just in case)
                if (!this.otherPlayers[data.player_id]) {
                    // Create new avatar for them (Blue Square)
                    const newAvatar = this.add.rectangle(data.x, data.y, 32, 32, 0x0000ff);
                    this.otherPlayers[data.player_id] = newAvatar;
                } else {
                    // Update their position
                    this.otherPlayers[data.player_id].x = data.x;
                    this.otherPlayers[data.player_id].y = data.y;
                }
            }
        };
    }

    update(time) {
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(160);
        } else {
            this.player.body.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.body.setVelocityY(-330);
        }

        // Emit our position to the server 20 times a second
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            if (time - this.lastEmitTime > 50) { 
                this.ws.send(JSON.stringify({
                    action: 'player_moved',
                    x: this.player.x,
                    y: this.player.y
                }));
                this.lastEmitTime = time;
            }
        }
    }
}
