import type { APIRoute } from "astro";
import { generateProjectHeroSvg } from "../../utils/generateProjectHeroSvg";
import projectsData from "../../data/projects.json";

export async function getStaticPaths() {
    return projectsData.map((project) => ({
        params: { id: project.id },
        props: { title: project.title, status: project.status, year: project.year },
    }));
}

export const GET: APIRoute = async ({ props }) => {
    const svg = await generateProjectHeroSvg(
        props.title as string,
        props.status as string,
        props.year as number,
    );
    return new Response(svg, {
        headers: { "Content-Type": "image/svg+xml" },
    });
};
