// Script to clear all quiz-related data from localStorage
// Run this in browser console: copy and paste the content

(function() {
  console.log('🧹 Starting complete localStorage cleanup...');

  // Clear main quiz storage
  localStorage.removeItem('course_quizzes');

  // Clear all quiz-related keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('quiz_') ||
      key.startsWith('course_quiz') ||
      key.includes('quiz') ||
      key.includes('answers') ||
      key.includes('progress') ||
      key.includes('test')
    )) {
      keysToRemove.push(key);
    }
  }

  // Remove all found keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('🗑️ Removed:', key);
  });

  console.log('✅ Cleanup complete! Removed', keysToRemove.length, 'keys');
  console.log('🔄 Please refresh the page to see the empty form');

  // Auto refresh after 2 seconds
  setTimeout(() => {
    window.location.reload();
  }, 2000);

})();