/**
 * 0 = IDLE
 * 
 * 1 = NEW
 * 
 * 2 = COUNT
 * 
 * 3 = CANCEL
 */
// Button A: Request a new ticket
input.onButtonPressed(Button.A, function () {
    if (pendingRequest != 0) {
        basic.showString("BUSY")
    } else {
        pendingRequest = 1
        basic.showString("ASK")
        requestStartedAt = input.runningTime()
        radio.sendValue("NEW", 0)
    }
})
// Button A+B: Cancel latest ticket
input.onButtonPressed(Button.AB, function () {
    if (pendingRequest != 0) {
        basic.showString("BUSY")
    } else if (lastTicket == 0) {
        basic.showString("NO")
    } else {
        pendingRequest = 3
        basic.showString("CXL")
        requestStartedAt = input.runningTime()
        radio.sendValue("CANCEL", lastTicket)
    }
})
// Button B: Check waiting count
input.onButtonPressed(Button.B, function () {
    if (pendingRequest != 0) {
        basic.showString("BUSY")
    } else {
        pendingRequest = 2
        basic.showString("CHK")
        requestStartedAt = input.runningTime()
        radio.sendValue("COUNT", 0)
    }
})
// Receive responses from Board 2
radio.onReceivedValue(function (name, value) {
    if (name == "TICKET" && pendingRequest == 1) {
        lastTicket = value
        pendingRequest = 0
        basic.showString("T")
        basic.showNumber(value)
    } else if (name == "CLOSED" && pendingRequest == 1) {
        pendingRequest = 0
        basic.showString("CLOSED")
    } else if (name == "WAIT" && pendingRequest == 2) {
        pendingRequest = 0
        basic.showString("WAIT")
        basic.showNumber(value)
    } else if (name == "CXL_OK" && pendingRequest == 3 && value == lastTicket) {
        pendingRequest = 0
        lastTicket = 0
        basic.showString("OK")
    } else if (name == "CXL_NO" && pendingRequest == 3 && value == lastTicket) {
        pendingRequest = 0
        basic.showString("DENIED")
    } else if (name == "CALLED" && value == lastTicket) {
        basic.showString("GO")
        basic.showNumber(value)
    }
})
let lastTicket = 0
let requestStartedAt = 0
let pendingRequest = 0
radio.setGroup(42)
basic.showString("B1")
// Timeout protection
basic.forever(function () {
    if (pendingRequest != 0 && input.runningTime() - requestStartedAt > 5000) {
        pendingRequest = 0
        basic.showString("TIMEOUT")
    }
    basic.pause(200)
})
