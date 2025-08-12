import { useRef, useEffect } from 'react'
import {
  Application,
  Graphics,
  Sprite,
  Assets,
  Text,
  Container,
} from 'pixi.js'
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
      const host = containerRef.current
      if (!host) return

      const app = new Application()
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        background: 0x0e0f13,        // ✅ couleur de fond visible
        antialias: true,
      })

      if (destroyed) {
        app.destroy(true, { children: true })
        return
      }

      // Sécurité : s'assurer qu'un stage existe
      if (!app.stage) app.stage = new Container()

      app.ticker.maxFPS = 30
      host.appendChild(app.canvas)
      appRef.current = app

      // ----- Viewport -----
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

      // ----- Config -----
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

      // ---------- v8: texture de point pré-rendu ----------
      const makeCircleTexture = (r, color) => {
        const g = new Graphics()
        // Important : dessiner en coordonnées positives pour des bounds valides
        g.circle(r, r, r).fill({ color })
        const tex = app.renderer.generateTexture(g)
        g.destroy(true)
        return tex
      }

      const texByTier = {}
      for (const [tier, color] of Object.entries(tierColors)) {
        texByTier[tier] = makeCircleTexture(radius, color)
      }

      // ---------- Layers ----------
      const dotsLayer = new Container()   // ✅ simple Container pour assurer l’affichage
      const emblemLayer = new Container()
      viewport.addChild(dotsLayer)
      viewport.addChild(emblemLayer)

      // ---------- Breathing des centres ----------
      const clusterMotion = {}
      for (const key in tierPositions) {
        const { x, y } = tierPositions[key]
        clusterMotion[key] = {
          baseX: x,
          baseY: y,
          angle: Math.random() * Math.PI * 2,
          speed: 0.01 + Math.random() * 0.01,
        }
      }

      const tierDots = {}
      const tierOffsets = {}

      // ---------- Création des dots (Sprites) ----------
      let created = 0
      for (const user of users) {
        const [tierRaw] = (user.rank || 'UNRANKED').split(' ')
        const tier = (tierRaw || 'UNRANKED').toUpperCase()
        const center = tierPositions[tier] || { x: 500, y: 500 }

        if (!tierOffsets[tier]) tierOffsets[tier] = 0
        tierOffsets[tier]++

        const angle = Math.random() * Math.PI * 2
        const spawnR = exclusionRadius + 30 + Math.random() * 30

        const s = new Sprite(texByTier[tier] || texByTier.UNRANKED)
        // ⚠️ Sur un Container normal, l’ancre fonctionne
        s.anchor.set(0.5)
        s.x = center.x + Math.cos(angle) * spawnR
        s.y = center.y + Math.sin(angle) * spawnR
        s.vx = 0
        s.vy = 0

        dotsLayer.addChild(s)
        created++

        if (!tierDots[tier]) tierDots[tier] = []
        tierDots[tier].push({ dot: s, center })
      }
      console.log('Dots created:', created)

      // ---------- Emblèmes ----------
      const tierSprites = {}
      for (const tier in tierImgMap) {
        const imgPath = tierImgMap[tier]
        const center = tierPositions[tier]
        if (!imgPath || !center) continue

        const texture = await Assets.load(imgPath)
        const sprite = new Sprite(texture)
        sprite.width = 60
        sprite.height = 60
        sprite.x = center.x - sprite.width / 2
        sprite.y = center.y - sprite.height / 2
        sprite.eventMode = 'static'
        sprite.cursor = 'pointer'
        emblemLayer.addChild(sprite)
        tierSprites[tier] = sprite
      }

      // ---------- Label partagé pour les emblèmes ----------
      const uiLabel = new Text({
        text: '',
        style: { fontSize: 14, fill: 0xffffff, fontWeight: 'bold' },
      })
      const uiLabelBg = new Graphics()
      uiLabel.visible = false
      uiLabelBg.visible = false
      app.stage.addChild(uiLabelBg, uiLabel)

      const drawLabelBg = () => {
        const padding = 4
        const b = uiLabel.getLocalBounds()
        uiLabelBg.clear()
        uiLabelBg
          .roundRect(
            uiLabel.x - padding,
            uiLabel.y - padding,
            b.width + padding * 2,
            b.height + padding * 2,
            4
          )
          .fill({ color: 0x000000, alpha: 0.7 })
      }

      for (const tier in tierSprites) {
        const sprite = tierSprites[tier]
        sprite.on('pointerover', (e) => {
          const { x, y } = e.global
          uiLabel.text = tier
          uiLabel.x = x + 10
          uiLabel.y = y - 10
          uiLabel.visible = true
          uiLabelBg.visible = true
          drawLabelBg()
        })
        sprite.on('pointermove', (e) => {
          const { x, y } = e.global
          uiLabel.x = x + 10
          uiLabel.y = y - 10
          drawLabelBg()
        })
        sprite.on('pointerout', () => {
          uiLabel.visible = false
          uiLabelBg.visible = false
        })
      }

      // ---------- Animation ----------
      const attraction = 0.01
      const repulsion = 0.2
      const targetR = exclusionRadius
      const damping = 0.95

      app.ticker.add(() => {
        // breathing centres
        for (const key in clusterMotion) {
          const m = clusterMotion[key]
          m.angle += m.speed
          const ox = Math.cos(m.angle) * 10
          const oy = Math.sin(m.angle * 0.8) * 10
          const p = tierPositions[key]
          p.x = m.baseX + ox
          p.y = m.baseY + oy
        }

        // follow centres for emblems
        for (const tier in tierSprites) {
          const spr = tierSprites[tier]
          const c = tierPositions[tier]
          spr.x = c.x - spr.width / 2
          spr.y = c.y - spr.height / 2
        }

        // dots → simple spring to ring (plus de O(n²))
        for (const tier in tierDots) {
          const arr = tierDots[tier]
          const c = tierPositions[tier]
          for (let i = 0; i < arr.length; i++) {
            const d = arr[i].dot
            const dx = c.x - d.x
            const dy = c.y - d.y
            const dist = Math.hypot(dx, dy) || 1

            if (dist > targetR + 5) {
              d.vx += (dx / dist) * attraction
              d.vy += (dy / dist) * attraction
            } else if (dist < targetR) {
              d.vx -= (dx / dist) * repulsion
              d.vy -= (dy / dist) * repulsion
            }

            d.vx *= damping
            d.vy *= damping
            d.x += d.vx
            d.y += d.vy
          }
        }
      })

      // petit skew esthétique
      let a = 0
      app.ticker.add(() => {
        a += 0.01
        const dx = Math.cos(a) * 0.01
        const dy = Math.sin(a) * 0.01
        viewport.skew.set(dx, dy)
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
