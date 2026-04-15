import React from 'react';

const TaskCard = ({ task, onEdit, onDelete, isAdmin }) => {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    DONE: 'bg-green-100 text-green-800'
  };

  return (
    <div className="bg-white border shadow-sm rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{task.title}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
            {task.status}
          </span>
        </div>
        
        {task.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{task.description}</p>
        )}
        
        {isAdmin && task.user && (
          <div className="mb-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <strong>Owner:</strong> {task.user.name} ({task.user.email})
          </div>
        )}
      </div>

      <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onEdit(task)}
          className="flex-1 bg-white hover:bg-gray-50 text-indigo-600 font-medium py-1.5 px-3 border border-indigo-200 rounded text-sm transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="flex-1 bg-white hover:bg-red-50 text-red-600 font-medium py-1.5 px-3 border border-red-200 rounded text-sm transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
