class Position {
	constructor(positionId, aisleId, row, col, maxWeight, maxVolume, occupiedWeight = 0, occupiedVolume = 0, sku = undefined) {
		this.positionId = positionId;
		this.aisleId = aisleId;
		this.row = row;
		this.col = col;
		this.maxWeight = maxWeight;
		this.maxVolume = maxVolume;
		this.occupiedWeight = occupiedWeight;
		this.occupiedVolume = occupiedVolume;
		this.sku = sku;
	}
}

module.exports = Position;
