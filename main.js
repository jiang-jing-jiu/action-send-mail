const nodemailer = require("nodemailer")
const core = require("@actions/core")
const fs = require("fs")

function load(value) {
    if (value.startsWith("file://")) {
        const filepath = value.replace("file://", "")
        if(fs.existsSync(filepath)) {
            value = fs.readFileSync(filepath, "utf8")
        } else {
            value = ""
        }
    }
    return value
}

function get_from(from, username) {
    if (from.match(/.+<.+@.+>/)) {
        return from
    }
    return `"${from}" <${username}>`
}

async function main() {
    try {
        const server_address = core.getInput("server_address", { required: true })
        const server_port = core.getInput("server_port", { required: true })
        const username = core.getInput("username", { required: true })
        const password = core.getInput("password", { required: true })
        const subject = core.getInput("subject", { required: true })
        const body = core.getInput("body", { required: true })
        const to = core.getInput("to", { required: true })
        const from = core.getInput("from", { required: true })
        const content_type = core.getInput("content_type", { required: true })
        const attachments = core.getInput("attachments", { required: false })

        // if the email content is empty, don't send it
        content = load(body)
        if (content == "") {
            //return
            continue
        }

        const transport = nodemailer.createTransport({
            host: server_address,
            port: server_port,
            secure: server_port == "465",
            auth: {
                user: username,
                pass: password,
            }
        })

        const info = await transport.sendMail({
            from: get_from(from, username),
            to: load(to),
            subject: subject,
            text: content_type != "text/html" ? content : undefined,
            html: content_type == "text/html" ? content : undefined,
            attachments: attachments ? attachments.split(',').map(f => ({ path: f.trim() })) : undefined
        })

        console.log(info)
    } catch (error) {
        core.setFailed(error.message)
    }
}

main()
