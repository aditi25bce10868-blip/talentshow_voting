import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { subscribeToPlayerCount } from '../../firebase/db';
import { EASE_OUT } from '../../lib/motion';

export default function WaitingScreen({ gameState }) {
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToPlayerCount(setPlayerCount);
    return unsub;
  }, []);

  const joinUrl = gameState?.joinUrl || window.location.origin;
  const title = gameState?.title || 'Social Loop';

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-black">

      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-black">

        {/* Main background glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 70% 70% at 50% 45%,
                rgba(95, 25, 8, 0.22) 0%,
                rgba(45, 10, 3, 0.14) 35%,
                transparent 70%
              )
            `,
          }}
        />

        {/* Center orange glow */}
        <motion.div
          className="
            absolute
            top-1/2
            left-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-[38rem]
            h-[38rem]
            rounded-full
          "
          style={{
            background:
              'radial-gradient(circle, rgba(120,45,8,0.30) 0%, rgba(80,25,5,0.18) 30%, rgba(40,12,2,0.08) 50%, transparent 72%)',
            filter: 'blur(18px)',
          }}
          animate={{
            opacity: [0.65, 1, 0.65],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Top orange glow */}
        <motion.div
          className="
            absolute
            -top-32
            left-1/2
            -translate-x-1/2
            w-[32rem]
            h-[22rem]
            rounded-full
          "
          style={{
            background:
              'radial-gradient(circle, rgba(255,100,15,0.16) 0%, rgba(130,40,5,0.08) 40%, transparent 72%)',
            filter: 'blur(30px)',
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Bottom-left glow */}
        <motion.div
          className="
            absolute
            -bottom-32
            -left-24
            w-[30rem]
            h-[30rem]
            rounded-full
          "
          style={{
            background:
              'radial-gradient(circle, rgba(255,170,70,0.30) 0%, rgba(190,75,10,0.16) 25%, rgba(100,30,5,0.08) 48%, transparent 72%)',
            filter: 'blur(12px)',
          }}
          animate={{
            opacity: [0.65, 0.9, 0.65],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Bottom-right subtle glow */}
        <div
          className="
            absolute
            -bottom-40
            -right-32
            w-[30rem]
            h-[30rem]
            rounded-full
          "
          style={{
            background:
              'radial-gradient(circle, rgba(150,45,5,0.16) 0%, rgba(80,20,3,0.08) 45%, transparent 72%)',
            filter: 'blur(25px)',
          }}
        />

        {/* =====================================================
            DIAGONAL LIGHT STREAKS
        ===================================================== */}

        <svg
          className="absolute inset-0 w-full h-full opacity-40"
          preserveAspectRatio="none"
        >
          <defs>

            <linearGradient
              id="streakLeft"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="rgba(255,130,30,0.45)"
              />
              <stop
                offset="100%"
                stopColor="rgba(255,130,30,0)"
              />
            </linearGradient>

            <linearGradient
              id="streakRight"
              x1="100%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="rgba(255,130,30,0.40)"
              />
              <stop
                offset="100%"
                stopColor="rgba(255,130,30,0)"
              />
            </linearGradient>

          </defs>

          {/* Left streaks */}
          <line
            x1="-10%"
            y1="0%"
            x2="38%"
            y2="45%"
            stroke="url(#streakLeft)"
            strokeWidth="1"
          />

          <line
            x1="0%"
            y1="8%"
            x2="34%"
            y2="48%"
            stroke="url(#streakLeft)"
            strokeWidth="0.7"
          />

          <line
            x1="-5%"
            y1="18%"
            x2="28%"
            y2="50%"
            stroke="url(#streakLeft)"
            strokeWidth="0.5"
          />

          {/* Right streaks */}
          <line
            x1="110%"
            y1="0%"
            x2="62%"
            y2="45%"
            stroke="url(#streakRight)"
            strokeWidth="1"
          />

          <line
            x1="100%"
            y1="8%"
            x2="66%"
            y2="48%"
            stroke="url(#streakRight)"
            strokeWidth="0.7"
          />

          <line
            x1="105%"
            y1="18%"
            x2="72%"
            y2="50%"
            stroke="url(#streakRight)"
            strokeWidth="0.5"
          />

        </svg>

        {/* =====================================================
            FLOATING EMBERS
        ===================================================== */}

        {[
          { top: '8%', left: '10%', size: 3, delay: 0 },
          { top: '18%', left: '25%', size: 2, delay: 1.2 },
          { top: '12%', right: '15%', size: 3, delay: 2 },
          { top: '28%', right: '5%', size: 2, delay: 0.7 },
          { top: '42%', left: '7%', size: 2, delay: 1.8 },
          { top: '54%', right: '12%', size: 3, delay: 2.4 },
          { top: '72%', left: '15%', size: 2, delay: 1 },
          { top: '82%', right: '8%', size: 2, delay: 0.4 },
          { top: '88%', left: '35%', size: 2, delay: 2.1 },
          { top: '35%', left: '18%', size: 2, delay: 1.5 },
          { top: '65%', right: '25%', size: 2, delay: 0.9 },
        ].map((particle, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-orange-300"
            style={{
              top: particle.top,
              left: particle.left,
              right: particle.right,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              boxShadow:
                '0 0 10px rgba(255,150,50,0.8)',
            }}
            animate={{
              opacity: [0.15, 0.8, 0.15],
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3 + (index % 3),
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

      </div>


      {/* =========================================================
          AUDIENCE COUNT
      ========================================================= */}

      <motion.div
        key={playerCount}
        initial={{
          opacity: 0,
          y: -8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.25,
          ease: EASE_OUT,
        }}
        className="
          absolute
          top-4
          right-4
          sm:top-8
          sm:right-8
          rounded-2xl
          px-6
          py-3
          text-center
          bg-black/40
          border
          border-orange-500/20
          backdrop-blur-md
          shadow-[0_0_30px_rgba(255,100,20,0.08)]
          z-30
        "
      >
        <p
          className="
            text-orange-300
            text-sm
            font-semibold
            uppercase
            tracking-wider
          "
        >
          Audience
        </p>

        <p
          className="
            text-5xl
            font-black
            text-white
          "
        >
          {playerCount}
        </p>
      </motion.div>


      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}

      <div
        className="
          relative
          z-10
          flex
          flex-col
          items-center
          gap-7
          px-4
          pt-4
        "
      >

        {/* =====================================================
            TITLE
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
            ease: EASE_OUT,
          }}
          className="text-center"
        >

          <h1
            className="
              text-6xl
              sm:text-7xl
              font-black
              leading-none
              tracking-tight
            "
            style={{
              background:
                'linear-gradient(90deg, #ffb21c 0%, #ff6a00 50%, #ff8a00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {title}
          </h1>

          <p
            className="
              text-orange-300
              text-xl
              sm:text-2xl
              mt-3
              font-medium
            "
          >
            Join Now!
          </p>

        </motion.div>


        {/* =====================================================
            CENTER QR CODE
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
            ease: EASE_OUT,
            delay: 0.1,
          }}
          className="
            relative
            rounded-3xl
            p-6
            bg-black/50
            border
            border-orange-500/30
            backdrop-blur-md
            shadow-[0_0_45px_rgba(255,100,20,0.20)]
          "
        >

          <div
            className="
              absolute
              inset-0
              rounded-3xl
              pointer-events-none
            "
            style={{
              boxShadow:
                'inset 0 0 25px rgba(255,100,20,0.08), 0 0 25px rgba(255,100,20,0.10)',
            }}
          />

          <QRCodeSVG
            value={joinUrl}
            size={240}
            bgColor="transparent"
            fgColor="#ffffff"
            level="M"
          />

        </motion.div>


        {/* =====================================================
            ANIMATED DOTS
        ===================================================== */}

        <div className="flex gap-3">

          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              className="
                w-3
                h-3
                rounded-full
                bg-orange-400
              "
              style={{
                boxShadow:
                  '0 0 12px rgba(255,120,30,0.6)',
              }}
            />
          ))}

        </div>

      </div>


      {/* =========================================================
          LEFT SIDE QR CODE
          KEPT AS REQUESTED
      ========================================================= */}

      <motion.div
        initial={{
          opacity: 0,
          x: -20,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.5,
          ease: EASE_OUT,
          delay: 0.2,
        }}
        className="
          absolute
          left-[-2px]
          top-1/2
          -translate-y-1/2
          z-20
          w-[215px]
          rounded-2xl
          p-4
          bg-black/80
          border
          border-orange-500/20
          backdrop-blur-md
          shadow-[0_0_30px_rgba(255,100,20,0.12)]
        "
      >

        <QRCodeSVG
          value={joinUrl}
          size={185}
          bgColor="#050505"
          fgColor="#ffffff"
          level="M"
        />

        <p
          className="
            text-center
            text-white/50
            text-xs
            mt-2
          "
        >
          Scan to join
        </p>

      </motion.div>


      {/* =========================================================
          FOOTER
      ========================================================= */}

      <a
        href="https://deadtechguy.fun"
        target="_blank"
        rel="noopener noreferrer"
        className="
          absolute
          bottom-10
          left-0
          right-0
          text-center
          text-orange-300/70
          text-xs
          font-medium
          hover:text-orange-300
          transition-colors
          z-30
        "
      >
        Built by BashCraft WebDev Team 
      </a>

    </div>
  );
}
