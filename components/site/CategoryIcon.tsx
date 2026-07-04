type CategoryIconProps = {
  id: string;
  className?: string;
};

const paths: Record<string, string> = {
  transport: "M4 14h16l-2-5H6l-2 5Zm3 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM7 9l1.2-3.2A2 2 0 0 1 10.1 4h3.8a2 2 0 0 1 1.9 1.8L17 9",
  realty: "M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5Z",
  phones: "M9 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 15h2",
  computers: "M4 5h16v10H4V5Zm5 14h6m-8 0h10",
  repair: "M14 4l6 6-2.5 2.5-6-6L14 4ZM4 20l7.5-7.5 2 2L6 22H4v-2Z",
  fashion: "M8 5 5 8l3 3v10h8V11l3-3-3-3-2.5 2h-3L8 5Z",
  home: "M5 12h14v7H5v-7Zm2-5h10a2 2 0 0 1 2 2v3H5V9a2 2 0 0 1 2-2Z",
  jobs: "M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0h12v12H4V7h4Zm3 5h2",
  services: "M12 3l2 4 4 .6-3 3 .7 4.3L12 13l-3.7 1.9.7-4.3-3-3 4-.6 2-4Zm-7 16h14",
  kids: "M8 8a4 4 0 0 1 8 0v3h2v6a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-6h2V8Zm2 3h4V8a2 2 0 0 0-4 0v3Z",
  pets: "M7 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-8 8c0-2 1.5-4 3-4s3 2 3 4c0 1.3-1 2-3 2s-3-.7-3-2Zm-4-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  free: "M4 9h16v4H4V9Zm2 4h12v8H6v-8Zm6-4V5a2 2 0 1 1 2 2h-2Zm0 0V5a2 2 0 1 0-2 2h2Z"
};

export function CategoryIcon({ id, className }: CategoryIconProps) {
  return (
    <svg className={className ?? "category-svg"} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={paths[id] ?? paths.services} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
