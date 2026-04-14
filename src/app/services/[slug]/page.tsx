import { buildMetadata } from '@/lib/metadata';
import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import Solution from '@/models/Solution';
import { notFound } from 'next/navigation';
import ServiceSchema from '@/components/seo/ServiceSchema';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await dbConnect();
  // Using ID as slug based on other project parts, or if user adds slug field
  const service = await (Solution as any).findById(params.slug); 
  
  if (!service) return buildMetadata("Service non trouvé", "");

  return buildMetadata(
    service.title,
    service.description.substring(0, 160),
    `/services/${params.slug}`,
    service.image
  );
}

export default async function ServiceDetailPage({ params }: Props) {
  await dbConnect();
  const service = await (Solution as any).findById(params.slug);

  if (!service) notFound();

  return (
    <div className="container mx-auto p-12 pt-32 h-screen">
      <ServiceSchema 
        name={service.title} 
        description={service.description} 
        url={`https://sdkbatiment.com/services/${params.slug}`}
        image={service.image}
      />
      <h1 className="text-5xl font-black text-slate-800 mb-8">{service.title}</h1>
      <div className="prose lg:prose-xl text-slate-600">
        {service.description}
      </div>
    </div>
  );
}
