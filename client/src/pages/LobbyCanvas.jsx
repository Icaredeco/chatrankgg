import { useRef, useEffect } from 'react'
import { Application, Graphics, Sprite, Assets, Text, Circle, ParticleContainer } from 'pixi.js'
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

      // Optional: réduire la conso CPU/GPU
      app.ticker.maxFPS = 30

      container.appendChild(app.canvas)
      appRef.current = app

      // 🌍 Viewport scroll/zoom
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

      // ========= STEP 1: textures pré-rendues + ParticleContainer =========

      // Petit helper pour générer une texture de disque coloré
      const makeCircleTexture = (r, color) => {
        const g = new Graphics()
        g.beginFill(color)
        g.drawCircle(0, 0, r)
        g.endFill()
        // éviter le crop lors de generateTexture
        g.x = r
        g.y = r
        const tex = app.renderer.generateTexture(g)
        g.destroy(true)
        return tex
      }

      // Une texture par tier
      const texByTier = {}
      for (const [tier, color] of Object.entries(tierColors)) {
        texByTier[tier] = makeCircleTexture(radius, color)
      }

      // Un seul container de particules pour tous les points (ultra batché)
      const particlesRoot = new ParticleContainer(
        Math.max(users.length, 1000),
        { position: true } // +options si besoin (rotation/scale/alpha/tint)
      )
      viewport.addChild(particlesRoot)

      // ===================================================================

      const tierDots = {}
      const tierOffsets = {}
      const tiers = {
        UNRANKED: 1, IRON: 1, BRONZE: 1, SILVER: 1, GOLD: 1,
        PLATINUM: 1, EMERALD: 1, DIAMOND: 1, MASTER: 1, GRANDMASTER: 1, CHALLENGER: 1,
      }

      // Mouvement “breathing” des centres
      for (const key in tierPositions) {
        const { x, y } = tierPositions[key]
        clusterMotion[key] = {
          baseX: x,
          baseY: y,
          angle: Math.random() * Math.PI * 2,
          speed: 0.01 + Math.random() * 0.01,
        }
      }

      // Créer les DOTS en SPRITES (pas de Graphics, pas d’événements par dot)
      for (const user of users) {
        const [tier] = (user.rank || 'UNRANKED').split(' ')
        const upperTier = (tier || 'UNRANKED').toUpperCase()
        const center = tierPositions[upperTier] || { x: 500, y: 500 }

        if (!tierOffsets[upperTier]) tierOffsets[upperTier] = 0
        tierOffsets[upperTier]++

        const angle = Math.random() * Math.PI * 2
        const radiusSpawn = exclusionRadius + 30 + Math.random() * 30

        const sprite = new Sprite(texByTier[upperTier] || texByTier.UNRANKED)
        sprite.anchor.set(0.5)
        sprite.x = center.x + Math.cos(angle) * radiusSpawn
        sprite.y = center.y + Math.sin(angle) * radiusSpawn

        // props “physiques” custom
        sprite.vx = 0
        sprite.vy = 0
        sprite.radius = radius

        particlesRoot.addChild(sprite)

        if (!tierDots[upperTier]) tierDots[upperTier] = []
        tierDots[upperTier].push({ dot: sprite, center })
      }

      // Emblèmes de tiers (inchangé)
      const tierSprites = {}
      for (const tier in tiers) {
        const imgPath = tierImgMap[tier]
        const center = tierPositions[tier]
        if (imgPath && center) {
          const texture = await Assets.load(imgPath)
          const sprite = new Sprite(texture)
          sprite.width = 60
          sprite.height = 60
          sprite.x = center.x - sprite.width / 2
          sprite.y = center.y - sprite.height / 2
          viewport.addChild(sprite)
          tierSprites[tier] = sprite
        }
      }

      // 🎯 Animation (physique simple + breathing des centres)
      app.ticker.add(() => {
        // breathing des centres
        for (const key in clusterMotion) {
          const motion = clusterMotion[key]
          motion.angle += motion.speed
          const offsetX = Math.cos(motion.angle) * 10
          const offsetY = Math.sin(motion.angle * 0.8) * 10
          const pos = tierPositions[key]
          if (!pos) continue
          pos.x = motion.baseX + offsetX
          pos.y = motion.baseY + offsetY
        }

        // suivre les centres pour les emblèmes
        for (const tier in tierSprites) {
          const sprite = tierSprites[tier]
          const center = tierPositions[tier]
          sprite.x = center.x - sprite.width / 2
          sprite.y = center.y - sprite.height / 2
        }

        // Mise à jour des dots (attraction simple vers le cercle de rayon exclusionRadius)
        const attraction = 0.01
        const repulsion = 0.2
        const minDist = exclusionRadius

        for (const tier in tierDots) {
          const arr = tierDots[tier]
          const center = tierPositions[tier]
          for (let i = 0; i < arr.length; i++) {
            const d = arr[i].dot
            const dx = center.x - d.x
            const dy = center.y - d.y
            const dist = Math.hypot(dx, dy) || 1

            if (dist > minDist + 5) {
              d.vx += (dx / dist) * attraction
              d.vy += (dy / dist) * attraction
            } else if (dist < minDist) {
              d.vx -= (dx / dist) * repulsion
              d.vy -= (dy / dist) * repulsion
            }

            // NOTE: on a retiré la collision O(n²) entre dots → énorme gain
            d.vx *= 0.95
            d.vy *= 0.95
            d.x += d.vx
            d.y += d.vy
          }
        }
      })

      return () => {}
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
