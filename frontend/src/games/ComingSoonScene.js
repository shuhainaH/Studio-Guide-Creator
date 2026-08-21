import Phaser from 'phaser';

export default class ComingSoonScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ComingSoonScene' });
    }

    create() {
        const { width, height } = this.scale;
        
        this.add.text(width / 2, height / 2 - 50, 'Coming Soon!', {
            fontSize: '48px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontStyle: '900',
            fill: '#E25E3E',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 20, 'This game is currently under development.', {
            fontSize: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fill: '#F4F1EA',
        }).setOrigin(0.5);
    }
}
