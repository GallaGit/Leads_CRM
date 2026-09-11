import { Topbar } from "@/components/layout/topbar";

export default function PlaceholderPage({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <>
      <Topbar title={title} />
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-muted-fg">{note}</p>
        </div>
      </div>
    </>
  );
}
