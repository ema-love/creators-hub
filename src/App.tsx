import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { IntroProvider, useIntro } from './components/intro/IntroContext'
import { Intro } from './components/intro/Intro'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ScrollManager } from './components/layout/ScrollManager'
import { HomePage } from './pages/HomePage'

const FirstRoomPage = lazy(() => import('./pages/FirstRoomPage'))
const TicketsPage = lazy(() => import('./pages/TicketsPage'))
const VolunteerPage = lazy(() => import('./pages/VolunteerPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const TicketVerifyPage = lazy(() => import('./pages/TicketVerifyPage'))
const TicketOrderPage = lazy(() => import('./pages/TicketOrderPage'))
const StaffPage = lazy(() => import('./pages/StaffPage'))
const FindTicketsPage = lazy(() => import('./pages/FindTicketsPage'))

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
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/volunteer" element={<VolunteerPage />} />
              <Route path="/tickets/confirmation" element={<Navigate to="/tickets" replace />} />
              <Route path="/v/:token" element={<TicketVerifyPage />} />
              <Route path="/tickets/order" element={<TicketOrderPage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/tickets/check-in" element={<Navigate to="/staff" replace />} />
              <Route path="/tickets/find" element={<FindTicketsPage />} />
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
