import { CommunicationVehicle, Task, TaskFeedback, TaskRequest } from '../type.d.ts'

class User {
	userId: string
	task: Task
	cv: CommunicationVehicle
	paying: number
	utility: number

	constructor(
		userId: string,
		task: Task,
		cv: CommunicationVehicle,
	) {
		this.userId = userId
		this.task = task
		this.cv = cv
		this.paying = 0
		this.utility = 0
	}

	update(data: TaskFeedback) {
		this.paying = data.paying
		this.utility = data.utility
	}
	sendRequest(): TaskRequest {
		const request = {
			userId: this.userId,
			task: this.task,
			transmissionRate: this.cv.transmissionRate,
			updateCallback: (data: TaskFeedback) => {
				this.update(data)
			},
		}
		return request
	}
}
export default User
