"use client";

import { useEffect, useId } from "react";

declare global {
  interface Window {
    Redoc?: {
      init: (specUrl: string, options: object, element: HTMLElement) => void;
    };
  }
}

/** Embed ReDoc for a public OpenAPI URL (CDN — no npm dep). */
export function OpenApiReference({ specUrl }: { specUrl: string }) {
  const id = useId().replace(/:/g, "");
  const mountId = `redoc-${id}`;

  useEffect(() => {
    let cancelled = false;
    const existing = document.querySelector<HTMLScriptElement>("script[data-spotsync-redoc]");
    const run = () => {
      const el = document.getElementById(mountId);
      if (!el || cancelled || !window.Redoc) return;
      el.replaceChildren();
      window.Redoc.init(specUrl, { scrollYOffset: 64 }, el);
    };

    if (window.Redoc) {
      run();
      return () => {
        cancelled = true;
      };
    }

    const script =
      existing ??
      Object.assign(document.createElement("script"), {
        src: "https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js",
        async: true,
      });
    script.dataset.spotsyncRedoc = "1";
    script.addEventListener("load", run);
    if (!existing) document.body.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener("load", run);
    };
  }, [specUrl, mountId]);

  return (
    <div className="developers-openapi">
      <p className="developers-openapi__links">
        <a href={specUrl} target="_blank" rel="noopener noreferrer">
          openapi.yaml
        </a>
        {" · "}
        <a
          href={`https://editor.swagger.io/?url=${encodeURIComponent(specUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Swagger Editor
        </a>
      </p>
      <div id={mountId} className="developers-openapi__mount" />
    </div>
  );
}
