import {
	AlgorithmResult,
	BidderRequest,
	Bidders,
	BidResults,
	NotPayingResult,
	PayingResult,
	Price,
	TaskFeedback,
	TaskRequest,
	TaskRequests,
} from '../type.d.ts'

class Server {
	transmitionPower: number
	computationResource: number
	restComputationResource: number
	cost: number
	income: number
	utility: number
	taskRequests: TaskRequests
	bidders: Bidders
	payingResults: { [taskId: string]: PayingResult }
	soldUnitResourcePrice: Price
	constructor(transmitionPower: number, computationResource: number) {
		this.transmitionPower = transmitionPower
		this.computationResource = computationResource
		this.restComputationResource = computationResource

		this.cost = 0
		this.income = 0
		this.utility = 0
		this.soldUnitResourcePrice = 0
		this.taskRequests = {}
		this.bidders = {}
		this.payingResults = {}
	}

	receiveTaskRequests(requests: TaskRequest[]) {
		requests.forEach((request) => {
			const taskId: string = self.crypto.randomUUID()
			this.taskRequests[taskId] = request
		})
	}

	notifyUser(taskId: string, feedback: TaskFeedback) {
		this.taskRequests[taskId].updateCallback(feedback)
	}

	receiveBiddingRequest(requests: BidderRequest[]) {
		requests.forEach((request) => {
			const bidderId: string = self.crypto.randomUUID()
			this.bidders[bidderId] = request
		})
	}

	notifyAssistors(bidResults: BidResults) {
		for (const winnerBidderId in bidResults) {
			this.bidders[winnerBidderId].updateCallback(bidResults[winnerBidderId])
		}
	}

	execute(
		algorithm: (
			taskRequests: TaskRequests,
			restComputationResource: number,
			transmissionPower: number,
		) => AlgorithmResult,
	) {
		const noPayingResults: { [taskId: string]: NotPayingResult } = {}
		const mrnbpResult = algorithm(this.taskRequests, this.restComputationResource, this.transmitionPower)
		this.cost += mrnbpResult.serverCost
		this.income += mrnbpResult.serverIncome
		this.utility += mrnbpResult.serverUtility
		this.restComputationResource -= mrnbpResult.usedComputationResource
		this.soldUnitResourcePrice = mrnbpResult.avergeUnitResourcePrice
		for (const taskId in mrnbpResult.taskResults) {
			const result = mrnbpResult.taskResults[taskId]
			if ('paying' in result) {
				this.payingResults[taskId] = result

				const feedback = {
					utility: result.utilityFromUser,
					paying: result.paying,
				}
				this.notifyUser(taskId, feedback)
			}
			if ('willingToPay' in result) {
				noPayingResults[taskId] = result
			}
		}
		return noPayingResults
	}
}
export default Server
