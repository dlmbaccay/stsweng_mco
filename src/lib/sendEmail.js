import nodemailer from 'nodemailer'

export async function sendBanEmail(email, banStatus) {
	try {
		// create reusable transporter object using the default SMTP transport
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			host: 'smtp.gmail.com',
			port: 465,
			secure: true, // Use `true` for port 465, `false` for all other ports
			auth: {
				user: 'bantaybuddy.services@gmail.com',
				pass: process.env.NEXT_PUBLIC_EMAILPASS,
			},
		})

		const mailOptions = {
			from: '"BantayBuddy Support" <bantaybuddy.services@gmail.com>', // sender address
			to: '', // receiver
			subject: 'BantayBuddy - Ban Notice', // Subject line
			text: 'Hello world?', // plain text body
			html: '<b>Hello world?</b>', // html body
		}

		if (banStatus === 'temporary') {
			mailOptions.to = email
			mailOptions.text = 'Hello, you have been banned from BantayBuddy for 3 days.'
			mailOptions.html = '<b>Hello, you have been banned from BantayBuddy for 3 days.</b>'
		} else if (banStatus === 'permanent') {
			mailOptions.to = email
			mailOptions.text = 'Hello, you have been banned from BantayBuddy permanently.'
			mailOptions.html = '<b>Hello, you have been banned from BantayBuddy permanently.</b>'
		}

		try {
			await transporter.sendMail(mailOptions)
			console.log('Email sent successfully')
		} catch (err) {
			console.log(err)
		}

		return 'Email sent successfully'
	} catch (error) {
		console.log(error)
		return 'Internal server error'
	}
}

export default sendBanEmail
