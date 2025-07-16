'use client'

import { useEffect, useRef } from 'react'

// Extend Phaser types
declare global {
  namespace Phaser {
    namespace GameObjects {
      interface GameObject {
        isBomb?: boolean
      }
    }
  }
}

export default function GameComponent() {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<any>(null)

  useEffect(() => {
    // Phaser'ı dinamik olarak yükle
    const initGame = async () => {
      if (typeof window === 'undefined') return

      const Phaser = (await import('phaser')).default

      // Game configuration
      const CONFIG = {
        SCREEN_WIDTH: 700,
        SCREEN_HEIGHT: 500,
        LIVES: 3,
        FRUIT_SPAWN_INTERVAL: 1000,
        FRUIT_SPEED: 200,
        BUCKET_SPEED: 300,
        COLORS: {
          BACKGROUND: '#FF6B9D',
          WHITE: '#FFFFFF',
          BLUE: '#4ECDC4',
          BLACK: '#2C3E50',
          NEON_GREEN: '#00FF87',
          PURPLE: '#6C5CE7',
          ORANGE: '#FD79A8'
        },
        BOMB_CHANCE: 0.2
      }

      // Menu Scene
      class MenuScene extends Phaser.Scene {
        isMuted: boolean = false

        constructor() {
          super({ key: 'MenuScene' })
        }

        create() {
          // Background
          this.add.rectangle(CONFIG.SCREEN_WIDTH/2, CONFIG.SCREEN_HEIGHT/2, 
                            CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT, 
                            0xFF6B9D)

          // Title
          this.add.text(CONFIG.SCREEN_WIDTH/2, 100, '🍓 Strawberry Catcher', {
            fontSize: '48px',
            color: CONFIG.COLORS.WHITE,
            fontStyle: 'bold'
          }).setOrigin(0.5)

          // Subtitle
          this.add.text(CONFIG.SCREEN_WIDTH/2, 150, 'Catch strawberries, avoid bombs!', {
            fontSize: '20px',
            color: CONFIG.COLORS.WHITE
          }).setOrigin(0.5)

          // Start button
          const startButton = this.add.rectangle(CONFIG.SCREEN_WIDTH/2, 220, 120, 50, 0x4ECDC4)
          const startText = this.add.text(CONFIG.SCREEN_WIDTH/2, 220, 'START', {
            fontSize: '18px',
            color: CONFIG.COLORS.WHITE,
            fontStyle: 'bold'
          }).setOrigin(0.5)

          startButton.setInteractive({ useHandCursor: true })
          startButton.on('pointerdown', () => {
            this.scene.start('GameScene')
          })

          // High Score
          const highScore = localStorage.getItem('strawberryCatcherHighScore') || 0
          this.add.text(CONFIG.SCREEN_WIDTH/2, 300, `High Score: ${highScore}`, {
            fontSize: '16px',
            color: CONFIG.COLORS.WHITE,
            fontStyle: 'bold'
          }).setOrigin(0.5)
        }
      }

      // Game Scene
      class GameScene extends Phaser.Scene {
        score: number = 0
        lives: number = CONFIG.LIVES
        gameOver: boolean = false
        fruits: any[] = []
        lastFruitTime: number = 0
        highScore: number = 0
        bucket: any
        fruitGroup: any
        scoreText: any
        hearts: any[] = []

        constructor() {
          super({ key: 'GameScene' })
        }

        init() {
          this.score = 0
          this.lives = CONFIG.LIVES
          this.gameOver = false
          this.fruits = []
          this.lastFruitTime = 0
          this.highScore = parseInt(localStorage.getItem('strawberryCatcherHighScore') || '0')
        }

        preload() {
          this.load.image('strawberry', '/assets/images/strawberry.png')
          this.load.image('boundless', '/assets/images/boundless.jpg')
        }

        create() {
          // Background
          this.add.rectangle(CONFIG.SCREEN_WIDTH/2, CONFIG.SCREEN_HEIGHT/2, 
                            CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT, 
                            0xFF6B9D)

          // Create Boundless logo basket
          this.bucket = this.add.image(CONFIG.SCREEN_WIDTH/2, 450, 'boundless')
          this.bucket.setScale(0.24)
          this.bucket.setTint(0xFFFFFF)

          // Add physics body to basket
          this.physics.add.existing(this.bucket)
          this.bucket.body.setImmovable(true)
          this.bucket.body.setGravityY(-300)
          this.bucket.body.setVelocity(0, 0)
          this.bucket.setInteractive()

          // Create physics group
          this.fruitGroup = this.physics.add.group()

          // UI elements
          this.createUI()
          this.setupInput()

          // Collision detection
          this.physics.add.overlap(this.bucket, this.fruitGroup, this.catchFruit, undefined, this)
        }

        createUI() {
          // Score display
          this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
            fontSize: '20px',
            color: CONFIG.COLORS.WHITE,
            fontStyle: 'bold'
          })

          // Heart indicators
          this.hearts = []
          for (let i = 0; i < CONFIG.LIVES; i++) {
            const heart = this.add.text(20 + (i * 30), 50, '❤️', {
              fontSize: '20px'
            })
            this.hearts.push(heart)
          }

          // Back to menu button
          const menuButton = this.add.text(650, 20, '🏠', {
            fontSize: '24px'
          }).setOrigin(0.5)

          menuButton.setInteractive({ useHandCursor: true })
          menuButton.on('pointerdown', () => {
            this.scene.start('MenuScene')
          })
        }

        setupInput() {
          this.input.on('pointermove', (pointer: any) => {
            const newX = Phaser.Math.Clamp(pointer.x, 25, CONFIG.SCREEN_WIDTH - 25)
            this.bucket.setX(newX)
          })

          this.input.on('pointerdown', (pointer: any) => {
            const newX = Phaser.Math.Clamp(pointer.x, 25, CONFIG.SCREEN_WIDTH - 25)
            this.bucket.setX(newX)
          })
        }

        update(time: number) {
          if (this.gameOver) return

          this.spawnFruit(time)
          this.updateFruits()

          if (this.lives <= 0) {
            this.endGame()
          }
        }

        spawnFruit(time: number) {
          if (time - this.lastFruitTime > CONFIG.FRUIT_SPAWN_INTERVAL) {
            this.lastFruitTime = time

            const x = Phaser.Math.Between(30, CONFIG.SCREEN_WIDTH - 30)
            const y = -50
            const isBomb = Math.random() < CONFIG.BOMB_CHANCE

            let fruit: any
            if (isBomb) {
              fruit = this.add.circle(x, y, 20, 0xFF3838)
              fruit.setStrokeStyle(2, 0xFF0000)
              fruit.isBomb = true
            } else {
              fruit = this.add.image(x, y, 'strawberry')
              fruit.setScale(0.1)
              fruit.isBomb = false
            }

            this.physics.add.existing(fruit)
            if (fruit.body) {
              fruit.body.setVelocity(0, CONFIG.FRUIT_SPEED)
            }
            this.fruitGroup.add(fruit)
            this.fruits.push(fruit)
          }
        }

        updateFruits() {
          for (let i = this.fruits.length - 1; i >= 0; i--) {
            const fruit = this.fruits[i]
            
            if (fruit.y > CONFIG.SCREEN_HEIGHT + 50) {
              if (!fruit.isBomb) {
                this.loseLife()
              }
              fruit.destroy()
              this.fruits.splice(i, 1)
            }
          }
        }

        catchFruit(bucket: any, fruit: any) {
          if (fruit.isBomb) {
            this.loseLife()
            this.showEffect(fruit.x, fruit.y, '💥', 0xFF0000)
          } else {
            this.score++
            this.scoreText.setText(`Score: ${this.score}`)
            this.showEffect(fruit.x, fruit.y, '+1', 0x00FF00)

            if (this.score > this.highScore) {
              this.highScore = this.score
              localStorage.setItem('strawberryCatcherHighScore', this.highScore.toString())
            }
          }

          const index = this.fruits.indexOf(fruit)
          if (index > -1) {
            this.fruits.splice(index, 1)
          }
          fruit.destroy()
        }

        loseLife() {
          this.lives--

          if (this.lives >= 0 && this.hearts[this.lives]) {
            this.hearts[this.lives].setText('💔')
          }

          this.cameras.main.shake(200, 0.01)
        }

        showEffect(x: number, y: number, text: string, color: number) {
          const effect = this.add.text(x, y, text, {
            fontSize: '24px',
            color: '#' + color.toString(16).padStart(6, '0')
          }).setOrigin(0.5)

          this.tweens.add({
            targets: effect,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => effect.destroy()
          })
        }

        endGame() {
          this.gameOver = true
          this.scene.start('GameOverScene', {
            score: this.score,
            highScore: this.highScore
          })
        }
      }

      // Game Over Scene
      class GameOverScene extends Phaser.Scene {
        finalScore: number = 0
        highScore: number = 0

        constructor() {
          super({ key: 'GameOverScene' })
        }

        init(data: any) {
          this.finalScore = data.score || 0
          this.highScore = data.highScore || 0
        }

        create() {
          // Background
          this.add.rectangle(CONFIG.SCREEN_WIDTH/2, CONFIG.SCREEN_HEIGHT/2, 
                            CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT, 
                            0xFF6B9D)

          this.add.rectangle(CONFIG.SCREEN_WIDTH/2, CONFIG.SCREEN_HEIGHT/2, 
                            CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT, 
                            0x000000, 0.7)

          // Game Over title
          this.add.text(CONFIG.SCREEN_WIDTH/2, 100, 'GAME OVER', {
            fontSize: '48px',
            color: '#FF4444',
            fontStyle: 'bold'
          }).setOrigin(0.5)

          // Score information
          this.add.text(CONFIG.SCREEN_WIDTH/2, 160, `Your Score: ${this.finalScore}`, {
            fontSize: '24px',
            color: CONFIG.COLORS.WHITE,
            fontStyle: 'bold'
          }).setOrigin(0.5)

          this.add.text(CONFIG.SCREEN_WIDTH/2, 190, `High Score: ${this.highScore}`, {
            fontSize: '20px',
            color: '#FFD700',
            fontStyle: 'bold'
          }).setOrigin(0.5)

          // New record
          if (this.finalScore === this.highScore && this.finalScore > 0) {
            this.add.text(CONFIG.SCREEN_WIDTH/2, 220, '🎉 NEW RECORD! 🎉', {
              fontSize: '18px',
              color: '#FFD700',
              fontStyle: 'bold'
            }).setOrigin(0.5)
          }

          // Buttons
          const restartButton = this.add.rectangle(CONFIG.SCREEN_WIDTH/2 - 80, 300, 120, 50, 0x00AA00)
          const restartText = this.add.text(CONFIG.SCREEN_WIDTH/2 - 80, 300, 'PLAY AGAIN', {
            fontSize: '16px',
            color: CONFIG.COLORS.WHITE,
            fontStyle: 'bold'
          }).setOrigin(0.5)

          restartButton.setInteractive({ useHandCursor: true })
          restartButton.on('pointerdown', () => {
            this.scene.start('GameScene')
          })

          const menuButton = this.add.rectangle(CONFIG.SCREEN_WIDTH/2 + 80, 300, 120, 50, 0x4ECDC4)
          const menuText = this.add.text(CONFIG.SCREEN_WIDTH/2 + 80, 300, 'MAIN MENU', {
            fontSize: '16px',
            color: CONFIG.COLORS.WHITE,
            fontStyle: 'bold'
          }).setOrigin(0.5)

          menuButton.setInteractive({ useHandCursor: true })
          menuButton.on('pointerdown', () => {
            this.scene.start('MenuScene')
          })
        }
      }

      // Game configuration
      const gameConfig = {
        type: Phaser.AUTO,
        width: CONFIG.SCREEN_WIDTH,
        height: CONFIG.SCREEN_HEIGHT,
        parent: gameRef.current!,
        backgroundColor: CONFIG.COLORS.BACKGROUND,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
          }
        },
        scene: [MenuScene, GameScene, GameOverScene]
      }

      // Create game instance
      if (gameRef.current && !phaserGameRef.current) {
        phaserGameRef.current = new Phaser.Game(gameConfig)
      }
    }

    initGame()

    // Cleanup
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [])

  return (
    <div 
      ref={gameRef} 
      className="w-[700px] h-[500px]"
    />
  )
} 