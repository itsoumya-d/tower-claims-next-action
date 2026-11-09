import { describe, expect, it } from "vitest";
import { nextBestAction } from "../src/claimNextAction.js";

describe("nextBestAction", () => {
  it("prioritises missing documents over every other state", () => {
    const action = nextBestAction({ stage: "declined", daysSinceCustomerUpdate: 20, missingItems: ["Proof of ownership", "Photos"] });
    expect(action.code).toBe("upload_documents");
    expect(action.priority).toBe("high");
    expect(action.customerMessage).toContain("Proof of ownership, Photos");
  });

  it("gives a review path for a declined claim", () => {
    const action = nextBestAction({ stage: "declined", daysSinceCustomerUpdate: 2 });
    expect(action.code).toBe("review_decline");
    expect(action.priority).toBe("high");
  });

  it("asks for the excess after approval", () => {
    const action = nextBestAction({ stage: "approved", daysSinceCustomerUpdate: 1, excessOutstanding: true });
    expect(action.code).toBe("pay_excess");
    expect(action.customerMessage).toContain("excess");
  });

  it("escalates stale assessing claims after five days", () => {
    const action = nextBestAction({ stage: "assessing", daysSinceCustomerUpdate: 6 });
    expect(action.code).toBe("request_update");
    expect(action.customerMessage).toContain("6 days");
  });

  it("does not escalate an assessing claim within five days", () => {
    const action = nextBestAction({ stage: "assessing", daysSinceCustomerUpdate: 5 });
    expect(action.code).toBe("monitor");
  });

  it("acknowledges a lodged claim", () => {
    const action = nextBestAction({ stage: "lodged", daysSinceCustomerUpdate: 0 });
    expect(action.code).toBe("lodgement_received");
    expect(action.priority).toBe("medium");
  });

  it("closes the loop on a settled claim", () => {
    const action = nextBestAction({ stage: "settled", daysSinceCustomerUpdate: 1 });
    expect(action.code).toBe("claim_settled");
    expect(action.priority).toBe("low");
  });

  it("handles an awaiting-information state without missing items", () => {
    const action = nextBestAction({ stage: "awaiting_information", daysSinceCustomerUpdate: 3 });
    expect(action.code).toBe("confirm_information");
    expect(action.priority).toBe("medium");
  });
});
