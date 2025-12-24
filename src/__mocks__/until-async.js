// Mock for until-async module (used by MSW internally)
const until = async (promise) => {
  try {
    const data = await promise;
    return { error: null, data };
  } catch (error) {
    return { error, data: null };
  }
};

module.exports = { until };
module.exports.until = until;
