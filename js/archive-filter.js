const filterButtons = document.querySelectorAll('.selection-container .option');
const entries = document.querySelectorAll('.date-type-title-container');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');

        entries.forEach(entry => {
            if (filter === 'all' || entry.getAttribute('data-type') === filter) {
                entry.style.display = '';
            } else {
                entry.style.display = 'none';
            }
        });
    });
});
