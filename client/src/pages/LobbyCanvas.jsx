import { useRef, useEffect } from 'react'
import { Application, Graphics, Sprite, Assets, Circle } from 'pixi.js'
import { Viewport } from 'pixi-viewport'

// Images
import unrankedImg from './img/unranked.png'
import ironImg from './img/iron.png'
import bronzeImg from './img/bronze.png'
import silverImg from './img/silver.png'
import goldImg from './img/gold.png'
import platinumImg from './img/platinum.png'
import emeraldImg from './img/emerald.png'
import diamondImg from './img/diamond.png'
import masterImg from './img/master.png'
import grandmasterImg from './img/grandmaster.png'
import challengerImg from './img/challenger.png'

export default function LobbyCanvas({ users = [] }) {
  const containerRef = useRef(null)
  const appRef = useRef(null)

  useEffect(() => {
    let destroyed = false

    const setup = async () => {
      const clusterMotion = {}
      const container = containerRef.current
      if (!container) return

      const app = new Application()
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        backgroundAlpha: 0,
        antialias: true,
      })

      if (destroyed) {
        app.destroy(true, { children: true })
        return
      }

      container.appendChild(app.canvas)
      appRef.current = app

      // 🌍 Viewport
      const viewport = new Viewport({
        screenWidth: app.screen.width,
        screenHeight: app.screen.height,
        worldWidth: 4000,
        worldHeight: 4000,
        events: app.renderer.events,
      })

      app.stage.addChild(viewport)
      viewport.drag().wheel().decelerate()
      viewport.clampZoom({ minScale: 0.5, maxScale: 4 })

      const radius = 2
      const exclusionRadius = 45

      const tierColors = {
        IRON: 0x6e6e6e,
        BRONZE: 0xcd7f32,
        SILVER: 0xc0c0c0,
        GOLD: 0xffd700,
        PLATINUM: 0x00bfff,
        EMERALD: 0x50c878,
        DIAMOND: 0xb9f2ff,
        MASTER: 0xaa00ff,
        GRANDMASTER: 0xff4d4d,
        CHALLENGER: 0x00ffff,
        UNRANKED: 0x999999,
      }

      const tierPositions = {
        UNRANKED: { x: 130, y: 250 },
        IRON: { x: 350, y: 200 },
        BRONZE: { x: 580, y: 280 },
        SILVER: { x: 820, y: 230 },
        GOLD: { x: 1040, y: 250 },
        PLATINUM: { x: 1280, y: 270 },
        EMERALD: { x: 240, y: 550 },
        DIAMOND: { x: 460, y: 510 },
        MASTER: { x: 700, y: 580 },
        GRANDMASTER: { x: 930, y: 490 },
        CHALLENGER: { x: 1150, y: 500 },
      }

      const tierImgMap = {
        UNRANKED: unrankedImg,
        IRON: ironImg,
        BRONZE: bronzeImg,
        SILVER: silverImg,
        GOLD: goldImg,
        PLATINUM: platinumImg,
        EMERALD: emeraldImg,
        DIAMOND: diamondImg,
        MASTER: masterImg,
        GRANDMASTER: grandmasterImg,
        CHALLENGER: challengerImg,
      }

      const tierDots = {}
      const tiers = Object.keys(tierPositions)
      const tierOffsets = {}

      // Mouvement "respiration" pour chaque cluster
      for (const key in tierPositions) {
        const { x, y } = tierPositions[key]
        clusterMotion[key] = {
          baseX: x,
          baseY: y,
          angle: Math.random() * Math.PI * 2,
          speed: 0.01 + Math.random() * 0.01,
        }
      }

      const tierSprites = {}

      // Création des dots
      for (const user of users) {
        const [tier] = user.rank.split(' ')
        const upperTier = tier?.toUpperCase() || 'UNRANKED'
        const color = tierColors[upperTier] || 0xffffff
        const center = tierPositions[upperTier] || { x: 500, y: 500 }

        if (!tierOffsets[upperTier]) tierOffsets[upperTier] = 0
        tierOffsets[upperTier]++

        const angle = Math.random() * Math.PI * 2
        const radiusSpawn = exclusionRadius + 30 + Math.random() * 30

        const dot = new Graphics()
        dot.beginFill(color)
        dot.drawCircle(0, 0, radius)
        dot.endFill()

        dot.x = center.x + Math.cos(angle) * radiusSpawn
        dot.y = center.y + Math.sin(angle) * radiusSpawn
        dot.vx = 0
        dot.vy = 0
        dot.radius = radius
        dot.hitArea = new Circle(0, 0, 4)

        viewport.addChild(dot)

        if (!tierDots[upperTier]) tierDots[upperTier] = []
        tierDots[upperTier].push({ dot, center })
      }

      // Ajout des emblèmes
      for (const tier of tiers) {
        const imgPath = tierImgMap[tier]
        const center = tierPositions[tier]
        if (!imgPath || !center) continue

        const texture = await Assets.load(imgPath)
        const sprite = new Sprite(texture)
        sprite.width = 60
        sprite.height = 60
        sprite.x = center.x - sprite.width / 2
        sprite.y = center.y - sprite.height / 2
        viewport.addChild(sprite)
        tierSprites[tier] = sprite
      }

      // Animation
      app.ticker.add(() => {
        // respiration des centres
        for (const key in clusterMotion) {
          const m = clusterMotion[key]
          m.angle += m.speed
          const ox = Math.cos(m.angle) * 10
          const oy = Math.sin(m.angle * 0.8) * 10
          const p = tierPositions[key]
          if (p) {
            p.x = m.baseX + ox
            p.y = m.baseY + oy
          }
        }

        // mise à jour des emblèmes
        for (const tier in tierSprites) {
          const sprite = tierSprites[tier]
          const c = tierPositions[tier]
          sprite.x = c.x - sprite.width / 2
          sprite.y = c.y - sprite.height / 2
        }

        // mouvement des dots
        for (const tier in tierDots) {
          for (const { dot, center } of tierDots[tier]) {
            const dx = center.x - dot.x
            const dy = center.y - dot.y
            const dist = Math.hypot(dx, dy)
            const attraction = 0.01
            const repulsion = 0.2
            const minDist = exclusionRadius

            if (dist > minDist + 5) {
              dot.vx += (dx / dist) * attraction
              dot.vy += (dy / dist) * attraction
            } else if (dist < minDist) {
              dot.vx -= (dx / dist) * repulsion
              dot.vy -= (dy / dist) * repulsion
            }

            for (const other of tierDots[tier]) {
              if (other.dot === dot) continue
              const ox = other.dot.x - dot.x
              const oy = other.dot.y - dot.y
              const odist = Math.hypot(ox, oy)
              const minDist2 = dot.radius + other.dot.radius
              if (odist < minDist2 && odist > 0) {
                const force = 0.15
                dot.vx -= (ox / odist) * force
                dot.vy -= (oy / odist) * force
              }
            }

            dot.vx *= 0.95
            dot.vy *= 0.95
            dot.x += dot.vx
            dot.y += dot.vy
          }
        }
      })

      // skew léger
      let angle = 0
      app.ticker.add(() => {
        angle += 0.01
        const dx = Math.cos(angle) * 0.01
        const dy = Math.sin(angle) * 0.01
        viewport.skew.set(dx, dy)
      })
    }

    setup()

    return () => {
      destroyed = true
      if (appRef.current) {
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }
    }
  }, [users])

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />
}
