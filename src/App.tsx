import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { IntroProvider, useIntro } from './components/intro/IntroContext'
import { Intro } from './components/intro/Intro'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ScrollManager } from './components/layout/ScrollManager'
import { HomePage } from './pages/HomePage'

const FirstRoomPage = lazy(() => import('./pages/FirstRoomPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const TicketConfirmationPage = lazy(() => import('./pages/TicketConfirmationPage'))

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <IntroProvider>
        <Shell />
      </IntroProvider>
    </MotionConfig>
  )
}

function Shell() {
  const { status, runId } = useIntro()
  const playing = status === 'playing'

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollManager />

      {/* The site is always rendered; the intro sits above it and is never a gate. */}
      <div inert={playing}>
        <Header />
        <main id="main">
          <Suspense fallback={<div className="min-h-screen bg-ink" />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/the-first-room" element={<FirstRoomPage />} />
              <Route path="/tickets/confirmation" element={<TicketConfirmationPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>

      <AnimatePresence>{playing && <Intro key={runId} />}</AnimatePresence>
    </>
  )
}
