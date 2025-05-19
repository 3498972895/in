import CommunicationVehicle from './CommunicationVehcile.ts'
import { Task, TaskFeedback, TaskRecording, TaskRequest } from '../type.d.ts'
import { computeUserUtilityX1 } from '../utils/calculator.ts'
class User {
	userId: string
	timeWeight: number
	costWeight: number
	task: Task
	recorder: TaskRecording
	cv: CommunicationVehicle
	maximumAcceptablePrice: number
	preferenceCoefficient: number
	paying: number
	utilityX0: number
	utilityX1: number

	constructor(
		userId: string,
		timeWeight: number,
		costWeight: number,
		task: Task,
		recorder: TaskRecording,
		cv: CommunicationVehicle,
	) {
		this.userId = userId
		this.timeWeight = timeWeight
		this.costWeight = costWeight
		this.task = task
		this.recorder = recorder
		this.cv = cv
		this.maximumAcceptablePrice = 0
		this.preferenceCoefficient = 0
		this.paying = 0
		this.utilityX0 = 0
		this.utilityX1 = 0
	}
	update(data: TaskFeedback) {
		this.paying = data.paying
		this.recorder.executionLocation = data.executionLocation
		this.recorder.executionDuration = data.executionDuration
		this.recorder.allocatedComputationResource = data.allocatedComputationResource
		if (data.minimumComputationResource !== undefined) {
			this.recorder.minimumComputationResource = data.minimumComputationResource
		}
		this.utilityX1 = computeUserUtilityX1(
			this.recorder.transmissionEnergyCostOnServer,
			this.paying,
			this.recorder.transmissionDurationToServer,
			this.recorder.executionDuration,
			this.preferenceCoefficient,
		)
	}
	sendRequest(): TaskRequest {
		const request = {
			userId: this.userId,
			task: this.task,
			transmissionDurationToServer: this.recorder.transmissionDurationToServer,
			preferenceCoefficient: this.preferenceCoefficient,
			minimumComputationResource: this.recorder.minimumComputationResource,
			maximumAcceptablePrice: this.maximumAcceptablePrice,
			updateCallback: (data: TaskFeedback) => {
				this.update(data)
			},
		}
		return request
	}
}
export default User
