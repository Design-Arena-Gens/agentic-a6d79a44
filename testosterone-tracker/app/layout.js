export const metadata = {
  title: 'Тестостерон Трекер',
  description: 'Система отслеживания уровня тестостерона',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
