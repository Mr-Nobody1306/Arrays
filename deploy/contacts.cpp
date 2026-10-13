// Phone Contact App — arrays in C++
// Compile: g++ -std=c++17 -O2 -o contacts contacts.cpp && ./contacts
#include <algorithm>
#include <cstring>
#include <functional>
#include <iomanip>
#include <iostream>
#include <string>

const int CAPACITY = 20;

struct Contact {
    char name[30];
    char phone[16];
};

void printContacts(const Contact c[], int n) {
    std::cout << "contacts[" << n << "/" << CAPACITY << "]:\n";
    for (int i = 0; i < n; ++i)
        std::cout << "  [" << i << "] " << c[i].name << "  " << c[i].phone << "\n";
}

int linearSearch(const Contact c[], int n, const char* query, int& comparisons) {
    comparisons = 0;
    for (int i = 0; i < n; ++i) {
        ++comparisons;
        if (strstr(c[i].name, query) != nullptr) return i; // substring match
    }
    return -1;
}

bool addContact(Contact c[], int& n, const char* name, const char* phone) {
    if (n >= CAPACITY) { std::cout << "memory full: delete a contact first\n"; return false; }
    strncpy(c[n].name, name, sizeof(c[n].name) - 1); c[n].name[sizeof(c[n].name)-1] = '\0';
    strncpy(c[n].phone, phone, sizeof(c[n].phone) - 1); c[n].phone[sizeof(c[n].phone)-1] = '\0';
    ++n; // O(1) append
    return true;
}

bool insertSorted(Contact c[], int& n, const char* name, const char* phone) {
    if (n >= CAPACITY) return false;
    int pos = n;
    for (int i = 0; i < n; ++i)
        if (strcmp(name, c[i].name) < 0) { pos = i; break; }
    for (int i = n; i > pos; --i) c[i] = c[i-1]; // shift right O(n)
    strncpy(c[pos].name, name, 29); c[pos].name[29] = '\0';
    strncpy(c[pos].phone, phone, 15); c[pos].phone[15] = '\0';
    ++n;
    return true;
}

bool removeAt(Contact c[], int& n, int idx) {
    if (idx < 0 || idx >= n) return false;
    for (int i = idx; i + 1 < n; ++i) c[i] = c[i+1]; // shift left O(n)
    --n;
    return true;
}

void sortByName(Contact c[], int n) {
    std::sort(c, c + n, [](const Contact& a, const Contact& b){
        return strcmp(a.name, b.name) < 0;
    });
}

int main() {
    Contact contacts[CAPACITY];
    int n = 0;
    addContact(contacts, n, "Mr Nobody", "059-780-8824");
    addContact(contacts, n, "Princess Essiam", "024-987-6543");
    addContact(contacts, n, "Auntie Efya", "020-555-0192");
    addContact(contacts, n, "Yaw Darko", "027-342-8890");
    addContact(contacts, n, "Mama Akos", "054-718-2301");
    addContact(contacts, n, "Kofi Boateng", "023-456-7890");

    printContacts(contacts, n);
    sortByName(contacts, n);
    std::cout << "-- after sort --\n";
    printContacts(contacts, n);

    int cmp = 0;
    int idx = linearSearch(contacts, n, "Yaw", cmp);
    std::cout << "search \"Yaw\" -> index " << idx << " (" << cmp << " comparisons)\n";

    removeAt(contacts, n, 1);
    std::cout << "-- after removeAt(1) --\n";
    printContacts(contacts, n);
    return 0;
}
