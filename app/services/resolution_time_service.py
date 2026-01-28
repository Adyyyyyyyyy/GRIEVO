from datetime import datetime, timedelta

def get_resolution_indicator(created_at, expected_days):
    """
    Returns: On Time / Near Deadline / Delayed
    """
    if not created_at or expected_days is None:
        return "Unknown"

    deadline = created_at + timedelta(days=int(expected_days))
    now = datetime.now()

    # 1 day before deadline = near deadline
    near_deadline = deadline - timedelta(days=1)

    if now <= near_deadline:
        return "On Time"
    elif now <= deadline:
        return "Near Deadline"
    else:
        return "Delayed"
