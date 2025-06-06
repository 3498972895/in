import { BidderRequest, BidResult } from '../type.d.ts'
import { CommunicationVehicle } from '../type.d.ts'
class Assistor {
	assistorId: string
	cv: CommunicationVehicle
	cost: number
	income: number
	utility: number
	bidId: string | null

	constructor(assistorId: string, cv: CommunicationVehicle) {
		this.assistorId = assistorId
		this.cv = cv
		this.cost = 0
		this.income = 0
		this.utility = 0
		this.bidId = null
	}
	update(data: BidResult) {
		this.cost = data.winnerCost
		this.income = data.winnerIncome
		this.utility = data.winnerUtility
		this.bidId = data.bidId
	}

	sendRequest(): BidderRequest {
		const request = {
			assistor_id: this.assistorId,
			transmissionRate: this.cv.transmissionRate,
			computationResource: this.cv.computationResource ?? 0,
			updateCallback: (data: BidResult) => {
				this.update(data)
			},
		}
		return request
	}
}
export default Assistor
