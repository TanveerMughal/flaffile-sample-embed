import { ISpace, makeTheme, useSpace } from "@flatfile/react";
import React, { useState } from "react";
import { config } from "./config";
import { listener } from "./listener";

const spaceProps: ISpace = {
  name: "Embedded Space",
  // to test locally add your local vars here
  publishableKey: "pk_sFElLEGhagwWQcqC3CbKIteQkLFApGe8",
  environmentId: "us_env_LZB4XNFX",
  workbook: config,
  themeConfig: makeTheme({ primaryColor: "#546a76", textColor: "#fff" }),
  sidebarConfig: {
    showDataChecklist: false,
    showSidebar: false,
  },
  listener: listener,
};

let record: any = [];

export function getData(data: any) {
  record = data;
}

export default function App() {
  const [showSpace, setShowSpace] = useState(false);
  const space = useSpace({
    ...spaceProps,
    closeSpace: {
      operation: "contacts:submit",
      onClose: () => setShowSpace(false),
    },
  });

  return (
    <div style={{ padding: "16px" }}>
      <h1>Flatfile React Example</h1>
      <p>
        {/* display record here */}
        {record.map((item: any, index: any) => {
          return (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {item}
            </div>
          );
        })}
      </p>
      <button
        onClick={() => {
          setShowSpace(!showSpace);
        }}
      >
        {showSpace === true ? "Close" : "Open"} space
      </button>
      {showSpace && space}
    </div>
  );
}
