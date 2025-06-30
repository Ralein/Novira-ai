import ImageUpload from "@/app/(routes)/dashboard/_components/ImageUpload";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-100">
                    <h2 className='font-bold text-3xl'>Convert Wireframe to Code</h2>

      <ImageUpload />
    </main>
  );
}