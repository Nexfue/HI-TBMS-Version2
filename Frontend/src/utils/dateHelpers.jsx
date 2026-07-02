export const todayISO = () => {
  return new Date().toISOString().split("T")[0];
};

export const getDayPart = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
  });
};

export const getMonthYearPart = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

export const getDayName = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
  });
};

export const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};