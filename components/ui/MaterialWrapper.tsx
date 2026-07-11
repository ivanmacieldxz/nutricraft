"use client";

import { useEffect } from "react";

export function MaterialWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Importación dinámica en el cliente para evitar errores SSR con Web Components
    import("@material/web/button/filled-button.js");
    import("@material/web/button/outlined-button.js");
    import("@material/web/textfield/outlined-text-field.js");
    import("@material/web/icon/icon.js");
    import("@material/web/chips/filter-chip.js");
    import("@material/web/chips/chip-set.js");
  }, []);

  return <>{children}</>;
}
