import { cloneDeep } from 'lodash'
import { generateUsers } from '../utils/dataGeneration.ts'
import { SEED, SERVER_COMPUTATION_RESOURCE, SERVER_TRANSMITION_POWER } from '../experimentalParameters.ts'
import Server from '../entities/Server.ts'
import mrnbp from '../algorithms/mrnbp.ts'
import mvsp from '../algorithms/mvsp.ts'

const n = [15, 25, 35, 45, 55]
console.log(`SEED ${SEED}`)
console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
for (let i = 0; i < n.length; i++) {
	const users = generateUsers(n[i], SERVER_TRANSMITION_POWER)
	const cloneUsers = cloneDeep(users)

	const mrnbpServer = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)
	const mvspServer = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)

	mrnbpServer.receiveTaskRequests(users.map((user) => user.sendRequest()))
	mvspServer.receiveTaskRequests(cloneUsers.map((user) => user.sendRequest()))

	mrnbpServer.execute(mrnbp)
	mvspServer.execute(mvsp)

	console.log(
		`mrnbpServerUtility ${mrnbpServer.utility} unitPrice ${mrnbpServer.soldUnitResourcePrice}  usersUtility ${
			users.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
		}`,
	)
	console.log(
		`mvspServerUtility ${mvspServer.utility} unitPrice ${mvspServer.soldUnitResourcePrice}  usersUtility ${
			cloneUsers.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
		}`,
	)
	console.log('--------------------------------')
}
