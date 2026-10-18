
import { describe, expect, it } from "vitest";

import {
    filterFollowUps,
    getFollowUpStats,
    isOverdue,
    type FollowUp,
} from "./follow-ups";

const NOW = new Date("2026-10-18T12:00:00Z").getTime();

const followUps: FollowUp[] = [
    {
        id: "1",
        application_id: "app-1",
        due_at: "2026-10-17T12:00:00Z",
        status: "Pending",
        notes: null,
        completed_at: null,
    },
    {
        id: "2",
        application_id: "app-2",
        due_at: "2026-10-19T12:00:00Z",
        status: "Pending",
        notes: "Contact recruiter",
        completed_at: null,
    },
    {
        id: "3",
        application_id: "app-3",
        due_at: "2026-10-16T12:00:00Z",
        status: "Completed",
        notes: null,
        completed_at: "2026-10-17T12:00:00Z",
    },
];

describe("Follow-up business rules", () => {
    it("identifies an overdue pending follow-up", () => {
        expect(isOverdue(followUps[0], NOW)).toBe(true);
    });

    it("does not mark a future follow-up as overdue", () => {
        expect(isOverdue(followUps[1], NOW)).toBe(false);
    });

    it("does not mark completed follow-ups as overdue", () => {
        expect(isOverdue(followUps[2], NOW)).toBe(false);
    });

    it("does not mark a follow-up due exactly now as overdue", () => {
        expect(
            isOverdue(
                {
                    ...followUps[0],
                    due_at: "2026-10-18T12:00:00Z",
                },
                NOW
            )
        ).toBe(false);
    });

    it("handles invalid dates safely", () => {
        expect(
            isOverdue(
                {
                    ...followUps[0],
                    due_at: "invalid-date",
                },
                NOW
            )
        ).toBe(false);
    });

    it("filters all follow-ups", () => {
        expect(
            filterFollowUps(followUps, "All", NOW)
        ).toHaveLength(3);
    });

    it("filters pending follow-ups", () => {
        expect(
            filterFollowUps(followUps, "Pending", NOW)
        ).toHaveLength(2);
    });

    it("filters completed follow-ups", () => {
        expect(
            filterFollowUps(followUps, "Completed", NOW)
        ).toHaveLength(1);
    });

    it("filters overdue follow-ups", () => {
        const result = filterFollowUps(
            followUps,
            "Overdue",
            NOW
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("1");
    });

    it("calculates follow-up statistics", () => {
        expect(getFollowUpStats(followUps, NOW)).toEqual({
            pending: 2,
            overdue: 1,
            completed: 1,
        });
    });

    it("handles an empty follow-up list", () => {
        expect(getFollowUpStats([], NOW)).toEqual({
            pending: 0,
            overdue: 0,
            completed: 0,
        });

        expect(
            filterFollowUps([], "Overdue", NOW)
        ).toEqual([]);
    });
});
