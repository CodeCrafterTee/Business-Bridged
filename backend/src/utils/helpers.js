const generateReadinessScore = (entrepreneur) => {
  let score = 0;
  const weights = {
    compliance: 20,
    grooming: 30,
    stressTest: 20,
    mentorVouches: 20,
    financials: 10
  };

  if (entrepreneur.compliance_completed) score += weights.compliance;
  if (entrepreneur.grooming_completed) score += weights.grooming;
  if (entrepreneur.stress_test_passed) score += weights.stressTest;
  
  // Add mentor vouches (max 2 vouches = full points)
  if (entrepreneur.mentor_vouches) {
    score += Math.min(entrepreneur.mentor_vouches * 10, weights.mentorVouches);
  }

  // Financial health check (simplified)
  if (entrepreneur.fixed_cost && entrepreneur.variable_monthly_cost) {
    // Add financial logic here
    score += weights.financials;
  }

  return Math.min(100, score);
};

const formatResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

const formatError = (message, code = 500) => {
  return {
    success: false,
    error: {
      code,
      message
    }
  };
};

module.exports = {
  generateReadinessScore,
  formatResponse,
  formatError
};
