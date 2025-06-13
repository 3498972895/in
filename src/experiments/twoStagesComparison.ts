import { cloneDeep, isEqualWith, size } from 'lodash'
import { generateAssistors, generateUsers } from '../utils/dataGeneration.ts'
import {
	ASSISTOR_NUM,
	SEED,
	SERVER_COMPUTATION_RESOURCE,
	SERVER_TRANSMITION_POWER,
	USER_NUM,
} from '../experimentalParameters.ts'
import Server from '../entities/Server.ts'

import mrbp from '../algorithms/mrbp.ts'
import mvsp from '../algorithms/mvsp.ts'
import bgap from '../algorithms/bgap.ts'

import vitic from '../algorithms/vitic.ts'
import da121ma from '../algorithms/da121ma.ts'
import bgca from '../algorithms/bgca.ts'

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

const MEDIUM_EXIT_THRESHOLD = 0.4

const n = Deno.args[1]
console.log(`SEED ${SEED}`)
console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

const users = generateUsers(n as unknown as number, SERVER_TRANSMITION_POWER)
const cloneUsers1 = cloneDeep(users)
const cloneUsers2 = cloneDeep(users)
const cloneUsers3 = cloneDeep(users)
const cloneUsers4 = cloneDeep(users)
const cloneUsers5 = cloneDeep(users)
const cloneUsers6 = cloneDeep(users)
const cloneUsers7 = cloneDeep(users)
const cloneUsers8 = cloneDeep(users)

const assistors = generateAssistors(ASSISTOR_NUM, SERVER_TRANSMITION_POWER)
const cloneAssistors1 = cloneDeep(assistors)
const cloneAssistors2 = cloneDeep(assistors)
const cloneAssistors3 = cloneDeep(assistors)
const cloneAssistors4 = cloneDeep(assistors)
const cloneAssistors5 = cloneDeep(assistors)
const cloneAssistors6 = cloneDeep(assistors)
const cloneAssistors7 = cloneDeep(assistors)
const cloneAssistors8 = cloneDeep(assistors)

const mrbpIIviticServer = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)
const mrbpIIda121maServer = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)
const mrbpIIbgcaServer = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)
const mvspIIviticServerM = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)
const mvspIIda121maServerM = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)
const mvspIIbgcaServerM = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)
const bgapIIviticServer = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)
const bgapIIda121maServer = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)
const bgapIIbgcaServer = new Server(SERVER_TRANSMITION_POWER, SERVER_COMPUTATION_RESOURCE)

mrbpIIviticServer.receiveTaskRequests(users.map((user) => user.sendRequest()))
mrbpIIda121maServer.receiveTaskRequests(cloneUsers1.map((user) => user.sendRequest()))
mrbpIIbgcaServer.receiveTaskRequests(cloneUsers2.map((user) => user.sendRequest()))
mvspIIviticServerM.receiveTaskRequests(cloneUsers3.map((user) => user.sendRequest()))
mvspIIda121maServerM.receiveTaskRequests(cloneUsers4.map((user) => user.sendRequest()))
mvspIIbgcaServerM.receiveTaskRequests(cloneUsers5.map((user) => user.sendRequest()))
bgapIIviticServer.receiveTaskRequests(cloneUsers6.map((user) => user.sendRequest()))
bgapIIda121maServer.receiveTaskRequests(cloneUsers7.map((user) => user.sendRequest()))
bgapIIbgcaServer.receiveTaskRequests(cloneUsers8.map((user) => user.sendRequest()))

mrbpIIviticServer.receiveAssistorRequest(assistors.map((assistor) => assistor.sendRequest()))
mrbpIIda121maServer.receiveAssistorRequest(cloneAssistors1.map((assistor) => assistor.sendRequest()))
mrbpIIbgcaServer.receiveAssistorRequest(cloneAssistors2.map((assistor) => assistor.sendRequest()))
mvspIIviticServerM.receiveAssistorRequest(cloneAssistors3.map((assistor) => assistor.sendRequest()))
mvspIIda121maServerM.receiveAssistorRequest(cloneAssistors4.map((assistor) => assistor.sendRequest()))
mvspIIbgcaServerM.receiveAssistorRequest(cloneAssistors5.map((assistor) => assistor.sendRequest()))
bgapIIviticServer.receiveAssistorRequest(cloneAssistors6.map((assistor) => assistor.sendRequest()))
bgapIIda121maServer.receiveAssistorRequest(cloneAssistors7.map((assistor) => assistor.sendRequest()))
bgapIIbgcaServer.receiveAssistorRequest(cloneAssistors8.map((assistor) => assistor.sendRequest()))

mrbpIIviticServer.execute(mrbp).outsource(vitic)
mrbpIIda121maServer.execute(mrbp).outsource(da121ma)
mrbpIIbgcaServer.execute(mrbp).outsource(bgca)
mvspIIviticServerM.execute(mvsp, MEDIUM_EXIT_THRESHOLD).outsource(vitic)
mvspIIda121maServerM.execute(mvsp, MEDIUM_EXIT_THRESHOLD).outsource(da121ma)
mvspIIbgcaServerM.execute(mvsp, MEDIUM_EXIT_THRESHOLD).outsource(bgca)
bgapIIviticServer.execute(bgap).outsource(vitic)
bgapIIda121maServer.execute(bgap).outsource(da121ma)
bgapIIbgcaServer.execute(bgap).outsource(bgca)

console.log(`vehicles ${n}`)

console.log(
	`mrbpIIviticServerUtility ${mrbpIIviticServer.utility} unitPrice ${mrbpIIviticServer.soldUnitResourcePrice}  usersUtility ${
		users.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} asistorsUtility ${assistors.map((assistor) => assistor.utility).reduce((acc, utility) => acc + utility, 0)}
    offloading Ratio ${size(mrbpIIviticServer.payingResults) / size(mrbpIIviticServer.taskRequests)}`,
)
console.log(
	`mrbpIIda121maServerUtility ${mrbpIIda121maServer.utility} unitPrice ${mrbpIIda121maServer.soldUnitResourcePrice}  usersUtility ${
		cloneUsers1.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} asistorsUtility ${
		cloneAssistors1.map((assistor) => assistor.utility).reduce((acc, utility) => acc + utility, 0)
	} offloading Ratio ${size(mrbpIIda121maServer.payingResults) / size(mrbpIIda121maServer.taskRequests)}`,
)
console.log(
	`mrbpIIbgcaServerUtility ${mrbpIIbgcaServer.utility} unitPrice ${mrbpIIbgcaServer.soldUnitResourcePrice}  usersUtility ${
		cloneUsers2.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} asistorsUtility ${
		cloneAssistors2.map((assistor) => assistor.utility).reduce((acc, utility) => acc + utility, 0)
	} offloading Ratio ${size(mrbpIIbgcaServer.payingResults) / size(mrbpIIbgcaServer.taskRequests)}`,
)

console.log(
	`mvspIIviticServerMUtility ${mvspIIviticServerM.utility} unitPrice ${mvspIIviticServerM.soldUnitResourcePrice}  usersUtility ${
		cloneUsers3.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} asistorsUtility ${
		cloneAssistors3.map((assistor) => assistor.utility).reduce((acc, utility) => acc + utility, 0)
	} offloading Ratio ${size(mvspIIviticServerM.payingResults) / size(mvspIIviticServerM.taskRequests)}`,
)
console.log(
	`mvspIIda121maServerMUtility ${mvspIIda121maServerM.utility} unitPrice ${mvspIIda121maServerM.soldUnitResourcePrice}  usersUtility ${
		cloneUsers4.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} asistorsUtility ${
		cloneAssistors4.map((assistor) => assistor.utility).reduce((acc, utility) => acc + utility, 0)
	} offloading Ratio ${size(mvspIIda121maServerM.payingResults) / size(mvspIIda121maServerM.taskRequests)}`,
)
console.log(
	`mvspIIbgcaServerMUtility ${mvspIIbgcaServerM.utility} unitPrice ${mvspIIbgcaServerM.soldUnitResourcePrice}  usersUtility ${
		cloneUsers5.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} asistorsUtility ${
		cloneAssistors5.map((assistor) => assistor.utility).reduce((acc, utility) => acc + utility, 0)
	} offloading Ratio ${size(mvspIIbgcaServerM.payingResults) / size(mvspIIbgcaServerM.taskRequests)}`,
)

console.log(
	`bgapIIviticServerUtility ${bgapIIviticServer.utility} unitPrice ${bgapIIviticServer.soldUnitResourcePrice}  usersUtility ${
		cloneUsers6.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} asistorsUtility ${
		cloneAssistors6.map((assistor) => assistor.utility).reduce((acc, utility) => acc + utility, 0)
	} offloading Ratio ${size(bgapIIviticServer.payingResults) / size(bgapIIviticServer.taskRequests)}`,
)
console.log(
	`bgapIIda121maServerUtility ${bgapIIda121maServer.utility} unitPrice ${bgapIIda121maServer.soldUnitResourcePrice}  usersUtility ${
		cloneUsers7.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} asistorsUtility ${
		cloneAssistors7.map((assistor) => assistor.utility).reduce((acc, utility) => acc + utility, 0)
	} offloading Ratio ${size(bgapIIda121maServer.payingResults) / size(bgapIIda121maServer.taskRequests)}`,
)

console.log(
	`bgapIIbgcaServerUtility ${bgapIIbgcaServer.utility} unitPrice ${bgapIIbgcaServer.soldUnitResourcePrice}  usersUtility ${
		cloneUsers8.map((user) => user.utility).reduce((acc, utility) => acc + utility, 0)
	} asistorsUtility ${
		cloneAssistors8.map((assistor) => assistor.utility).reduce((acc, utility) => acc + utility, 0)
	} offloading Ratio ${size(bgapIIbgcaServer.payingResults) / size(bgapIIbgcaServer.taskRequests)}`,
)

console.log('--------------------------------')
