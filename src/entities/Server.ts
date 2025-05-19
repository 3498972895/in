import { BidderRequest, Bidders, BidItems, BidResults, TaskFeedbacks, TaskRequest, TaskRequests } from '../type.d.ts'
import ssupa from '../algorithms/ssupa.ts'
import bdpa from '../algorithms/bdpa.ts'
import da121ma from '../algorithms/da121ma.ts'

class Server {
	transmitionPower: number
	computationResource: number
	restComputationResource: number
	cost: number
	income: number
	utility: number
	taskRequests: TaskRequests
	bidders: Bidders
	taskFeedbacks: TaskFeedbacks
	constructor(transmitionPower: number, computationResource: number) {
		this.transmitionPower = transmitionPower
		this.computationResource = computationResource
		this.restComputationResource = computationResource

		this.cost = 0
		this.income = 0
		this.utility = 0
		this.taskRequests = {}
		this.bidders = {}
		this.taskFeedbacks = {}
	}

	receiveTaskRequest(request: TaskRequest) {
		const taskId: string = self.crypto.randomUUID()
		this.taskRequests[taskId] = request
	}

	notifyUsers(feedbacks: TaskFeedbacks) {
		Object.entries(feedbacks).forEach(([taskId, feedback]) => {
			this.taskRequests[taskId].updateCallback(feedback)
		})
	}

	receiveBiddingRequest(request: BidderRequest) {
		const bidderId: string = self.crypto.randomUUID()
		this.bidders[bidderId] = request
	}

	notifyAssistors(bidResults: BidResults) {
		for (const winnerBidderId in bidResults) {
			this.bidders[winnerBidderId].updateCallback(bidResults[winnerBidderId])
		}
	}

	stage3a() {
		/* stage3a executes ssupa, bdpa, da121ma algorithms sequencely */

		/* ssupa stage*/
		const ssupaResult = ssupa(this.taskRequests, this.restComputationResource)
		this.cost += ssupaResult.serverCost
		this.income += ssupaResult.serverIncome
		this.utility += ssupaResult.serverUtility
		this.restComputationResource -= ssupaResult.usedComputationResource
		for (const taskId in Object.keys(ssupaResult.tasksPaying)) {
			const paying = ssupaResult.tasksPaying[taskId]
			const executionLocation = 'server'
			const allocatedComputationResource = ssupaResult.taskResDistro[taskId]
			const executionDuration = this.taskRequests[taskId].task.delayTolerance
			this.taskFeedbacks[taskId] = { paying, executionLocation, executionDuration, allocatedComputationResource }
		}
		this.notifyUsers(this.taskFeedbacks)

		this.stage2a()
	}

	stage2a() {
		/* bdpa stage*/

		const restTaskRequests = Object.fromEntries(
			Object.entries(this.taskRequests).filter(([taskId]) => !Object.keys(this.taskFeedbacks).includes(taskId)),
		)
		const bdpaResult = bdpa(restTaskRequests, this.restComputationResource)

		this.cost += bdpaResult.serverCost
		this.income += bdpaResult.serverIncome
		this.utility += bdpaResult.serverUtility
		this.restComputationResource -= bdpaResult.usedComputationResource
		for (const taskId in Object.keys(bdpaResult.tasksPaying)) {
			const paying = bdpaResult.tasksPaying[taskId]
			const executionLocation = 'server'
			const allocatedComputationResource = bdpaResult.taskResDistro[taskId]
			const executionDuration = this.taskRequests[taskId].task.delayTolerance
			this.taskFeedbacks[taskId] = { paying, executionLocation, executionDuration, allocatedComputationResource }
		}
		this.notifyUsers(this.taskFeedbacks)

		/* da121ma stage*/
		const bidItems: BidItems = {}
		for (const unExecutedTaskId in bdpaResult.tasksWillingToPaying) {
			const bidId = self.crypto.randomUUID()
			const taskId = unExecutedTaskId
			const task = this.taskRequests[taskId].task
			const taskWillingToPaying = bdpaResult.tasksWillingToPaying[taskId]
			const transmitonDurationToServer = this.taskRequests[taskId].transmissionDurationToServer
			bidItems[bidId] = { taskId, task, taskWillingToPaying, transmitonDurationToServer }
		}
		const da121maResult = da121ma(bidItems, this.bidders, this.transmitionPower / Object.keys(this.bidders).length)

		this.cost += da121maResult.serverCost
		this.income += da121maResult.serverIncome
		this.utility += da121maResult.serverUtility

		for (const taskId in Object.keys(da121maResult.tasksPaying)) {
			const paying = da121maResult.tasksPaying[taskId]
			const executionLocation = 'assistor'
			const allocatedComputationResource = bdpaResult.taskResDistro[taskId]
			const executionDuration = this.taskRequests[taskId].task.delayTolerance

			this.taskFeedbacks[taskId] = { paying, executionLocation, executionDuration, allocatedComputationResource }
		}
		this.notifyUsers(this.taskFeedbacks)
		this.notifyAssistors(da121maResult.bidResults)
	}
}
export default Server
