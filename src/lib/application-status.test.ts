
import { describe, expect, it } from "vitest";

import {
    APPLICATION_STATUSES,
    isActiveApplicationStatus,
    isValidApplicationStatus
} from "./application-status";

describe("Application Status", () => {
    it("contains all supported statuses", () => {
        expect(APPLICATION_STATUSES).toEqual([
            "Saved",
            "Applied",
            "Screening",
            "Interview",
            "Offer",
            "Rejected"
        ]);
    });

    it("accepts a valid application status", () => {
        expect(isValidApplicationStatus("Applied")).toBe(true);
        expect(isValidApplicationStatus("Interview")).toBe(true);
    });

    it("rejects an invalid application status", () => {
        expect(isValidApplicationStatus("Unknown")).toBe(false);
        expect(isValidApplicationStatus("")).toBe(false);
    });

    it("identifies active applications", () => {
        expect(isActiveApplicationStatus("Saved")).toBe(true);
        expect(isActiveApplicationStatus("Applied")).toBe(true);
        expect(isActiveApplicationStatus("Screening")).toBe(true);
        expect(isActiveApplicationStatus("Interview")).toBe(true);
    });

    it("excludes rejected applications and offers from active statuses", () => {
        expect(isActiveApplicationStatus("Rejected")).toBe(false);
        expect(isActiveApplicationStatus("Offer")).toBe(false);
    });

    it("does not consider unknown statuses active", () => {
        expect(isActiveApplicationStatus("Unknown")).toBe(false);
    });
});
