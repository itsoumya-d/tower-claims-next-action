export type ClaimStage =
  | "lodged"
  | "assessing"
  | "awaiting_information"
  | "approved"
  | "declined"
  | "settled";

export type Priority = "low" | "medium" | "high";

export interface ClaimInput {
  stage: ClaimStage;
  daysSinceCustomerUpdate: number;
  missingItems?: string[];
  excessOutstanding?: boolean;
}

export interface NextAction {
  code: string;
  title: string;
  customerMessage: string;
  priority: Priority;
}

const cleanItems = (items: string[] = []): string[] =>
  items.map((item) => item.trim()).filter(Boolean);

export function nextBestAction(input: ClaimInput): NextAction {
  const missing = cleanItems(input.missingItems);
  const days = Math.max(0, Math.floor(input.daysSinceCustomerUpdate));

  if (missing.length > 0) {
    const list = missing.join(", ");
    return {
      code: "upload_documents",
      title: "Documents needed",
      customerMessage: `Upload the outstanding item${missing.length > 1 ? "s" : ""}: ${list}. This is the fastest way to keep the claim moving.`,
      priority: "high",
    };
  }

  if (input.stage === "declined") {
    return {
      code: "review_decline",
      title: "Review the decision",
      customerMessage: "Read the decision letter and the review options. If something is incorrect, request a review with the claim team.",
      priority: "high",
    };
  }

  if (input.stage === "approved" && input.excessOutstanding) {
    return {
      code: "pay_excess",
      title: "Pay the excess",
      customerMessage: "Your claim is approved. Pay the excess shown in your approval letter so the settlement can be released.",
      priority: "high",
    };
  }

  if (input.stage === "assessing" && days > 5) {
    return {
      code: "request_update",
      title: "Request a progress update",
      customerMessage: `There has been no customer update for ${days} days. Ask the claim team for the current status and the next expected milestone.`,
      priority: "high",
    };
  }

  if (input.stage === "awaiting_information") {
    return {
      code: "confirm_information",
      title: "Confirm information",
      customerMessage: "Check the information already provided and confirm anything still outstanding with the claim team.",
      priority: "medium",
    };
  }

  if (input.stage === "lodged") {
    return {
      code: "lodgement_received",
      title: "Lodgement received",
      customerMessage: "Your claim is lodged. Keep your reference handy and upload any documents requested by the claim team.",
      priority: "medium",
    };
  }

  if (input.stage === "settled") {
    return {
      code: "claim_settled",
      title: "Settlement complete",
      customerMessage: "Your claim is settled. Check that the payment and any remaining invoices match the settlement letter.",
      priority: "low",
    };
  }

  return {
    code: "monitor",
    title: "No action needed",
    customerMessage: "There is no action for you right now. The claim team will contact you at the next milestone.",
    priority: "low",
  };
}
