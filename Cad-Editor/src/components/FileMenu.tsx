import React from "react";

interface FileMenuProps {
  onExport: () => void;
  onImport: (json: string) => void;
}

export const FileMenu: React.FC<FileMenuProps> = ({ onExport, onImport }) => {
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) onImport(reader.result.toString());
    };
    reader.readAsText(file);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        padding: "8px",
        background: "#333",
        color: "white",
      }}
    >
      <button onClick={onExport}>Export</button>
      <input type="file" accept=".json" onChange={handleImport} />
    </div>
  );
};
