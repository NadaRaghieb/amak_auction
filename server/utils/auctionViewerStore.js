const auctionViewers = new Map();

function getViewerCount(auctionId) {
  return auctionViewers.get(auctionId.toString()) || 0;
}

function incrementViewer(auctionId) {
  const key = auctionId.toString();
  const current = auctionViewers.get(key) || 0;
  const next = current + 1;
  auctionViewers.set(key, next);
  return next;
}

function decrementViewer(auctionId) {
  const key = auctionId.toString();
  const current = auctionViewers.get(key) || 0;
  const next = Math.max(current - 1, 0);

  if (next === 0) {
    auctionViewers.delete(key);
  } else {
    auctionViewers.set(key, next);
  }

  return next;
}

function getAllViewerCounts() {
  const result = {};
  for (const [key, value] of auctionViewers.entries()) {
    result[key] = value;
  }
  return result;
}

module.exports = {
  getViewerCount,
  incrementViewer,
  decrementViewer,
  getAllViewerCounts,
};