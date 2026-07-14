function normalize(value: string): string {
  return value.toLowerCase();
}

export function departmentMatchesStrategicLabel(label: string, department: string): boolean {
  const normalizedLabel = normalize(label);
  const normalizedDepartment = normalize(department);

  if (normalizedDepartment === "sales") {
    return (
      normalizedLabel.includes("churn") ||
      normalizedLabel.includes("enterprise") ||
      normalizedLabel.includes("renewal")
    );
  }
  if (normalizedDepartment === "finance") {
    return (
      normalizedLabel.includes("cost") ||
      normalizedLabel.includes("invoice") ||
      normalizedLabel.includes("budget")
    );
  }
  if (normalizedDepartment === "legal") {
    return (
      normalizedLabel.includes("soc2") ||
      normalizedLabel.includes("compliance") ||
      normalizedLabel.includes("contract")
    );
  }
  if (normalizedDepartment === "marketing") {
    return (
      normalizedLabel.includes("growth") ||
      normalizedLabel.includes("content") ||
      normalizedLabel.includes("campaign")
    );
  }
  if (normalizedDepartment === "operations") {
    return (
      normalizedLabel.includes("support") ||
      normalizedLabel.includes("response") ||
      normalizedLabel.includes("service")
    );
  }
  if (normalizedDepartment === "hr") {
    return (
      normalizedLabel.includes("role") ||
      normalizedLabel.includes("hiring") ||
      normalizedLabel.includes("talent")
    );
  }

  return false;
}
