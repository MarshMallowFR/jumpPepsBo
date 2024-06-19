import { lusitana } from '@/app/ui/style/fonts';
 
export default function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {"Bienvenue sur le back office de Jump'Peps"}
      </div>
    </main>
  );
}