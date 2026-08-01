import { getProjectById, type Project } from '@/entities/project/server';
import { DocumentReaderContainer } from '@/features/document-reader';
import { notFound } from 'next/navigation';

export interface CategoryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { id } = await params;

  let project = await getProjectById(id);

  // Demo fallback project if database record not found for testing demo IDs
  if (!project) {
    if (id === 'demo-app-1' || id === 'demo-manga-1' || id === 'demo-anime-1' || id === 'demo-vn-1') {
      const demoProjects: Record<string, Project> = {
        'demo-app-1': {
          id: 'demo-app-1',
          title: 'SomaCore App',
          description: 'Plataforma clínica de somatotipado genético y fenotípico para diagnóstico asistido.',
          category: 'apps-software',
          status: 'En Producción',
          image_url: '/images/pale-veil.png',
          file_type: 'markdown',
          markdown_content: `---
title: "SomaCore App: Documentación y Guía"
author: "BioTech Division WHS"
reading_time_minutes: 5
bgm: ""
---

# Introducción a SomaCore

SomaCore es una plataforma biomédica diseñada para diagnóstico asistido y somatotipado genético.

> [!lore] Códice del Sistema
> Integración neuronal mediante redes convulsionales aplicadas al fenotipo humano.

**Dr. Marcus:** "Los datos de la muestra indican estabilidad en las hebras genéticas."

[Diagnóstico completado con éxito]{color: poison}
`,
        },
        'demo-manga-1': {
          id: 'demo-manga-1',
          title: 'Umbral',
          description: 'Manga de misterio y exploración psicológica. Capítulos en emisión semanal.',
          category: 'manga',
          status: 'En Emisión',
          image_url: '/images/umbral.png',
          file_type: 'markdown',
          markdown_content: `---
title: "Capítulo I: El Despertar de las Sombras Arcanas"
author: "Wiener Hound Studios"
chapter_number: 1
reading_time_minutes: 12
bgm: ""
ambient_light: "#0D0A08"
default_font: "serif"
tags:
  - capitulo/1
  - fantasía/ciberpunk
  - estado/publicado
---

%% NOTA DEL CREADOR: Este capítulo debe mantener una atmósfera tensa. %%

# El Despertar de las Sombras Arcanas

La niebla descendía con lentitud sobre los riscos de [[Monte Trueno|La Cumbre Helada]], envolviendo las ruinas del antiguo santuario. El viento soplaba con un ~susurro glacial~ que helaba la sangre de cualquiera que se atreviera a cruzar la frontera.

> [!note] Cronicones de Valoria — Registro 402
> La guerra civil de los cristales concluyó en el año 512 del Calendario Solar. Desde entonces, el paso de las cumbres ha permanecido custodiado por la orden de los Inquisidores de Acero.

***

## Escena 1: La Enmienda en el Paso Helado

Elena se detuvo junto al borde del acantilado, ajustando el embozo de su capa mientras contemplaba el valle ensombrecido.

**Elena:** "Debemos acelerar el paso antes de que los centinelas divisen la señal en las torres."

**Marcus:** *[Ajustando el broche de su armadura de hierro]* "Los caminos principales están custodiados por la [Guardia Real]{color: blood}. Atravesar el cañón a ciegas es un suicidio."

> [!thought] Monólogo Interno (Elena)
> *Si Marcus descubre que llevo el [[Códice Místico]] en mi zurrón, jamás me dejará continuar hacia la ciudadela...*

Elena apretó el puño, sintiendo el pulso tibio de la reliquia oculta en su cinturón. El cristal emitía un [resplandor de maná purísimo]{glow: #00bfff} que atravesaba la gruesa tela de su jubón.

---

## Escena 2: La Revelación en el Altar

Al adentrarse en la bóveda subterránea, las antorchas se encendieron solas con una llama de color pálido.

> [!lore] Códice: El Anillo de la Tormenta
> Artefacto forjado en las profundidades del Monte Trueno por los maestros alquimistas. Otorga un incremento de +5 a la manipulación de la energía elemental [arcana]{color: arcane}.

Elena extendió la mano hacia la inscripción tallada en la piedra antigua. El texto decía:

*Este pergamino contiene la fórmula de la* <u>alquimia ancestral</u>. *Solo aquellos dignos de tocar el* [Triunfo Celestial]{color: gold} *podrán desencadenar el verdadero poder de los elementos.*

<speech speaker="Sombra Ancestral" avatar="/images/pale-veil.png" side="right" color="#DC143C">
—Habéis osado perturbar el reposo de los caídos. El precio por vuestra audacia será pagado en sangre.
</speech>

> [!warning] Alerta de Emboscada
> Se escucha el crujido de metal contra piedra a tus espaldas. El enemigo ha bloqueado la salida de la cámara.

**Marcus:** "¡Atrás, Elena! ¡Desenvaina la espada!"

El techo de la caverna comenzó a resquebrajarse peligrosamente. Las grietas se expandieron como relámpagos de luz violeta por todas las paredes de granito.

[¡El suelo se derrumbó por completo bajo sus pies!]{effect: shake}

Un denso humo emergió de las profundidades, mientras una [Presencia etérea y distante...]{effect: fade} pronunciaba las últimas palabras del conjuro.

==Palabra de Poder Activada==: *El destino de Valoria ahora descansa en manos de los últimos custodios.*
`,
        },
      };

      project = demoProjects[id] || null;
    }
  }

  if (!project) {
    notFound();
  }

  return <DocumentReaderContainer project={project} />;
}
