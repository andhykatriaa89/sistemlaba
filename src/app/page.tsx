import Calculator from '@/components/Calculator';

export const metadata = {
  title: 'Sistem Laba — Kalkulator Keuntungan Usaha',
  description: 'Hitung laba bersih usaha Anda dengan cepat dan mudah.',
};

export default function Home() {
  return (
    <main>
      <Calculator />
    </main>
  );
}
