function notifyBuffAlreadyApplied(existingRite, name) {
	ui.notifications.info(`${existingRite.label} has already been applied to ${name}!`);
}

function notifyBuffSuccessfullyApplied(newRite, name) {
	ui.notifications.info(`Successfully applied ${newRite.label} to ${name}!`);
}

function notifyBuffReverted(existingRite, name) {
	ui.notifications.info(`Successfully removed ${existingRite.label} from ${name}!`);
}

const notifier = {
	notifyBuffAlreadyApplied,
	notifyBuffSuccessfullyApplied,
	notifyBuffReverted
};

export default notifier;
