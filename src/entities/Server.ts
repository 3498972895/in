import { isEmpty, size } from 'lodash'
import {
	AssistorRequest,
	NotPayingResult,
	OutsourcingFeedback,
	OutsourcingTasks,
	Participants,
	PayingResult,
	Price,
	StageIIResult,
	StageIResult,
	TaskFeedback,
	TaskRequest,
	TaskRequests,
} from '../type.d.ts'

class Server {
	transmissionPower: number
	computationResource: number
	restComputationResource: number
	cost: number
	income: number
	utility: number
	taskRequests: TaskRequests
	participants: Participants
	payingResults: { [taskId: string]: PayingResult }
	noPayingResults: { [taskId: string]: NotPayingResult }
	soldUnitResourcePrice: Price
	constructor(transmissionPower: number, computationResource: number) {
		this.transmissionPower = transmissionPower
		this.computationResource = computationResource
		this.restComputationResource = computationResource

		this.cost = 0
		this.income = 0
		this.utility = 0
		this.soldUnitResourcePrice = 0
		this.taskRequests = {}
		this.participants = {}
		this.payingResults = {}
		this.noPayingResults = {}
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

	receiveAssistorRequest(requests: AssistorRequest[]) {
		requests.forEach((request) => {
			const paticipantId: string = self.crypto.randomUUID()
			this.participants[paticipantId] = request
		})
	}

	notifyAssistor(paticipantId: string, feedback: OutsourcingFeedback) {
		this.participants[paticipantId].updateCallback(feedback)
	}

	execute(
		algorithm: (
			taskRequests: TaskRequests,
			restComputationResource: number,
			allocatedTransmissionPower: number,
			stackelbergUserExitThreshold?: number,
		) => StageIResult,
		stackelbergUserExitThreshold: number = 0,
	) {
		const allocatedTransmisionPower = this.transmissionPower / size(this.taskRequests)
		const noPayingResults: { [taskId: string]: NotPayingResult } = {}
		const algorithmResult = algorithm(
			this.taskRequests,
			this.restComputationResource,
			allocatedTransmisionPower,
			stackelbergUserExitThreshold,
		)
		this.cost += algorithmResult.serverCost
		this.income += algorithmResult.serverIncome
		this.utility += algorithmResult.serverUtility
		this.restComputationResource -= algorithmResult.usedComputationResource
		this.soldUnitResourcePrice = algorithmResult.avergeUnitResourcePrice
		for (const taskId in algorithmResult.taskResults) {
			const result = algorithmResult.taskResults[taskId]
			if ('paying' in result) {
				this.payingResults[taskId] = result

				const userFeedback = {
					utility: result.utilityFromUser,
					paying: result.paying,
				}
				this.notifyUser(taskId, userFeedback)
			}
			if ('willingToPay' in result) {
				noPayingResults[taskId] = result
			}
		}
		this.noPayingResults = noPayingResults
		return this
	}
	outsource(
		algorithm: (
			outsourcingTasks: OutsourcingTasks,
			participants: Participants,
			allocatedTransmissionPower: number,
		) => StageIIResult,
	) {
		if (!isEmpty(this.noPayingResults)) {
			const allocatedTransmisionPower = this.transmissionPower / size(this.participants)
			const outsourcingTasks: OutsourcingTasks = {}
			for (const taskId in this.noPayingResults) {
				const outsourcingId: string = self.crypto.randomUUID()
				outsourcingTasks[outsourcingId] = {
					taskId: taskId,
					dataSize: this.taskRequests[taskId].task.dataSize,
					complexity: this.taskRequests[taskId].task.complexity,
					allowedTime: this.noPayingResults[taskId].allowedTime,
					nominalHighestBidPrice: this.noPayingResults[taskId].willingToPay,
				}
			}

			const algorithmResult = algorithm(outsourcingTasks, this.participants, allocatedTransmisionPower)
			this.cost += algorithmResult.serverCost
			this.income += algorithmResult.serverIncome
			this.utility += algorithmResult.serverUtility
			for (const taskId in algorithmResult.outsourcingResults) {
				const choosenParticipantId = algorithmResult.outsourcingResults[taskId].choosenParticipantId
				const outsourcingId = algorithmResult.outsourcingResults[taskId].outsourcingId
				const participantIncome = algorithmResult.outsourcingResults[taskId].choosenParticipantIncome
				const participantCost = algorithmResult.outsourcingResults[taskId].choosenParticipantCost
				const participantUtility = algorithmResult.outsourcingResults[taskId].choosenParticipantUtility

				const outsourcingFeedback: OutsourcingFeedback = {
					outsourcingId: outsourcingId,
					income: participantIncome,
					cost: participantCost,
					utility: participantUtility,
				}
				this.notifyAssistor(choosenParticipantId, outsourcingFeedback)

				const paying = this.noPayingResults[taskId].willingToPay
				const executionLocation = 'assistor'
				const allocatedComputationResource =
					algorithmResult.outsourcingResults[taskId].allocatedComputationResource
				const executionDuration = algorithmResult.outsourcingResults[taskId].executionDuration
				const taskCost = algorithmResult.outsourcingResults[taskId].taskCost
				const taskDuration = this.noPayingResults[taskId].taskDuration
				const utilityFromUser = this.noPayingResults[taskId].utilityFromUser
				const utilityFromServer = paying - taskCost
				this.payingResults[taskId] = {
					paying,
					executionLocation,
					allocatedComputationResource,
					executionDuration,
					taskCost,
					taskDuration,
					utilityFromUser,
					utilityFromServer,
				}
				const userFeedback = {
					utility: utilityFromUser,
					paying: paying,
				}
				this.notifyUser(taskId, userFeedback)
			}
		}
	}
}
export default Server
