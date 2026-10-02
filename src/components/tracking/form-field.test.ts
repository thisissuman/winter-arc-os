import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { FormField } from "./form-field";

describe("FormField accessibility", () => {
  it("connects the visible label, hint, and error to its control without dropping existing descriptions", () => {
    const html = renderToStaticMarkup(FormField({ name: "weekly-target", label: "Weekly target", hint: "Use a whole number.", error: "Enter a target.", children: createElement("input", { id: "weekly-target", "aria-describedby": "existing-help" }) }));
    expect(html).toContain('for="weekly-target"');
    expect(html).toContain('aria-describedby="existing-help weekly-target-hint weekly-target-error"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-errormessage="weekly-target-error"');
    expect(html).toContain('id="weekly-target-error" role="alert"');
  });
});
