function notifyRiteAlreadyApplied(existingRite, name) {
	ui.notifications.info(`${existingRite.riteLabel} has already been applied to ${name}!`);
}

function notifyRiteSuccessfullyApplied(newRite, name) {
	ui.notifications.info(`Successfully applied ${newRite.riteLabel} to ${name}!`);
}

function notifyRiteReverted(existingRite, name) {
	ui.notifications.info(`Successfully removed ${existingRite.riteLabel} from ${name}!`);
}

const notifier = {
	notifyRiteAlreadyApplied,
	notifyRiteSuccessfullyApplied,
	notifyRiteReverted
};

export default notifier;
