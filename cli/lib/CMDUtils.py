import os


def execute(p_command):
    print p_command
    os.system(p_command)


def clear():
    os.system('cls' if os.name == 'nt' else 'clear')


def print_error(error_msg, exit_on_finish=True):
    print ""
    print "************** ERROR: " + error_msg
    print ""
    if exit_on_finish:
        exit(1)


def print_title(title_msg):
    line = ""

    for x in title_msg:
        line += "#"

    print ""
    print line
    print title_msg
    print line
    print ""
