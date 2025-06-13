import { cloneDeep, size } from 'lodash'
import { generateUsers } from '../utils/dataGeneration.ts'
import { SEED, SERVER_COMPUTATION_RESOURCE, SERVER_TRANSMITION_POWER, USER_NUM } from '../experimentalParameters.ts'
import Server from '../entities/Server.ts'
import mrbp from '../algorithms/mrbp.ts'
import mvsp from '../algorithms/mvsp.ts'
import bgap from '../algorithms/bgap.ts'

if (Deno.args.length == 0) {
	console.log(`exit code 1`)
	Deno.exit(1)
}

if (Deno.args[0] !== '-n') {
	console.log(`exit code 2`)
	Deno.exit(2)
}

if (Deno.args[1] == undefined) {
	console.log(`exit code 3`)
	Deno.exit(3)
}
if (isNaN(Number(Deno.args[1]))) {
	console.log(`exit code 4`)
	Deno.exit(4)
}
if (!USER_NUM.includes(Number(Deno.args[1]))) {
	console.log(`exit code 5`)
	Deno.exit(5)
}

const HIGH_EXIT_THRESHOLD = 0.6
const MEDIUM_EXIT_THRESHOLD = 0.4
const LOW_EXIT_THRESHOLD = 0.2

const n = Deno.args[1]
console.log(`SEED ${SEED}`)
console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
const users = generateUsers(n as unknown as number, SERVER_TRANSMITION_POWER)
const cloneUsers1 = cloneDeep(users)
const cloneUsers2 = cloneDeep(users)
const cloneUsers3 = cloneDeep(users)
const cloneUsers4 = cloneDeep(users)

const mrbpServer = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)
const mvspServerH = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)
const mvspServerM = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)
const mvspServerL = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)
const bgapServer = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)

mrbpServer.receiveTaskRequests(users.map((user) => user.sendRequest()))
mvspServerH.receiveTaskRequests(cloneUsers1.map((user) => user.sendRequest()))
mvspServerM.receiveTaskRequests(cloneUsers2.map((user) => user.sendRequest()))
mvspServerL.receiveTaskRequests(cloneUsers3.map((user) => user.sendRequest()))
bgapServer.receiveTaskRequests(cloneUsers4.map((user) => user.sendRequest()))

mrbpServer.execute(mrbp)
mvspServerH.execute(mvsp, HIGH_EXIT_THRESHOLD)
mvspServerM.execute(mvsp, MEDIUM_EXIT_THRESHOLD)
mvspServerL.execute(mvsp, LOW_EXIT_THRESHOLD)
bgapServer.execute(bgap)

console.log(`vehicles ${n}`)

console.log(
	`mrbpServerUtility ${mrbpServer.utility} unitPrice ${mrbpServer.soldUnitResourcePrice}  usersUtility ${
		users.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} offloading Ratio ${size(mrbpServer.payingResults) / size(mrbpServer.taskRequests)}`,
)
console.log(
	`mvspServerHUtility ${mvspServerH.utility} unitPrice ${mvspServerH.soldUnitResourcePrice}  usersUtility ${
		cloneUsers1.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} exit threshold ${HIGH_EXIT_THRESHOLD} offloading Ratio ${
		size(mvspServerH.payingResults) / size(mvspServerH.taskRequests)
	}`,
)
console.log(
	`mvspServerMUtility ${mvspServerM.utility} unitPrice ${mvspServerM.soldUnitResourcePrice}  usersUtility ${
		cloneUsers2.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} exit threshold ${MEDIUM_EXIT_THRESHOLD} offloading Ratio ${
		size(mvspServerM.payingResults) / size(mvspServerM.taskRequests)
	}`,
)
console.log(
	`mvspServerLUtility ${mvspServerL.utility} unitPrice ${mvspServerL.soldUnitResourcePrice}  usersUtility ${
		cloneUsers3.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} exit threshold ${LOW_EXIT_THRESHOLD} offloading Ratio ${
		size(mvspServerL.payingResults) / size(mvspServerL.taskRequests)
	}`,
)
console.log(
	`bgapServerUtility ${bgapServer.utility} unitPrice ${bgapServer.soldUnitResourcePrice}  usersUtility ${
		cloneUsers4.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} offloading Ratio ${size(bgapServer.payingResults) / size(bgapServer.taskRequests)}`,
)
console.log('--------------------------------')
console.log(bgapServer.restComputationResource / bgapServer.computationResource)
