import { useState } from "react";

export default function useJourney() {
  const [journey, setJourney] = useState({
    intakeComplete: false,
    groomingComplete: false,
    complianceComplete: false,
    stressComplete: false,
    score: 0
  });

  return { journey, setJourney };
}