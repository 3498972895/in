import { AssistorRequest, OutsourcingFeedback } from '../type.d.ts'
import { CommunicationVehicle } from '../type.d.ts'
class Assistor {
	assistorId: string
	cv: CommunicationVehicle
	cost: number
	income: number
	utility: number
	outsourcingId: string | null

	constructor(assistorId: string, cv: CommunicationVehicle) {
		this.assistorId = assistorId
		this.cv = cv
		this.cost = 0
		this.income = 0
		this.utility = 0
		this.outsourcingId = null
	}
	update(data: OutsourcingFeedback) {
		this.outsourcingId = data.outsourcingId
		this.cost = data.cost
		this.income = data.income
		this.utility = data.utility
	}

	sendRequest(): AssistorRequest {
		const request = {
			assistorId: this.assistorId,
			transmissionRate: this.cv.transmissionRate,
			computationResource: this.cv.computationResource ?? 0,
			updateCallback: (data: OutsourcingFeedback) => {
				this.update(data)
			},
		}
		return request
	}
}
export default Assistor
